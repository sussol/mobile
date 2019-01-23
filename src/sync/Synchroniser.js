/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { SyncQueue } from './SyncQueue';
import { SyncDatabase } from './SyncDatabase';
import { generateSyncJson } from './outgoingSyncUtils';
import { integrateRecord } from './incomingSyncUtils';
import { SETTINGS_KEYS } from '../settings';
import {
  incrementSyncProgress,
  setSyncProgress,
  setSyncProgressMessage,
  setSyncTotal,
  setSyncError,
  setSyncIsSyncing,
  setSyncCompletionTime,
} from './actions';

const {
  SYNC_IS_INITIALISED,
  SYNC_PRIOR_FAILED,
  SYNC_SITE_NAME,
  SYNC_SERVER_ID,
  SYNC_SITE_ID,
  SYNC_URL,
  HARDWARE_UUID,
} = SETTINGS_KEYS;

const MIN_SYNC_BATCH_SIZE = 10;
const MAX_SYNC_BATCH_SIZE = 500;
const OPTIMAL_BATCH_SPEED = 5;

/**
 * Provides core synchronization functionality, initilising the database with an
 * initial full sync, pushing, and pulling (any regular scheduling of synchronization
 * must be coordinated externally)
 * @param  {Realm}             database       The local database
 * @param  {SyncAuthenticator} authenticator  Provides authentication with the sync server
 * @param  {Settings}          settings       Access to locally stored settings
 */
export class Synchroniser {
  constructor(database, authenticator, settings, dispatch) {
    this.database = new SyncDatabase(database);
    this.authenticator = authenticator;
    this.settings = settings;
    this.syncQueue = new SyncQueue(this.database);
    this.dispatch = dispatch;
    this.extraHeaders = { 'msupply-site-uuid': settings.get(HARDWARE_UUID) };
    this.refreshSyncParams();
    if (this.isInitialised()) this.syncQueue.enable();
  }

  /**
   * Redux progress setting functions
   */
  setTotal = totalCount => this.dispatch(setSyncTotal(totalCount));
  incrementProgress = increment => this.dispatch(incrementSyncProgress(increment));
  setProgress = currentCount => this.dispatch(setSyncProgress(currentCount));
  setProgressMessage = message => this.dispatch(setSyncProgressMessage(message));
  setError = errorMessage => this.dispatch(setSyncError(errorMessage));
  setIsSyncing = isSyncing => this.dispatch(setSyncIsSyncing(isSyncing));
  setCompletionTime = time => this.dispatch(setSyncCompletionTime(time));

  refreshSyncParams = () => {
    this.serverURL = this.settings.get(SYNC_URL);
    this.thisSiteId = this.settings.get(SYNC_SITE_ID);
    this.serverId = this.settings.get(SYNC_SERVER_ID);
    this.thisSiteName = this.settings.get(SYNC_SITE_NAME);
    this.authHeader = this.authenticator.getAuthHeader();
    this.batchSize = MIN_SYNC_BATCH_SIZE;
  };

  /**
   * Wipe the current database, check that the given url can be synced against
   * using the given name and password, and if so populate the database by pulling
   * from the remote server.
   * @param  {string} serverURL        The URL to be synced against
   * @param  {string} syncSiteName     The username to use in sync auth
   * @param  {string} syncSitePassword The password to use in sync auth
   * @return {Promise}                 Resolve if successfully authenticated and
   *                                   initialised, otherwise throw error
   */
  initialise = async (serverURL, syncSiteName, syncSitePassword) => {
    this.setIsSyncing(true);
    this.setProgressMessage('Initialising...');
    this.syncQueue.disable(); // Stop sync queue listening to database changes
    // Check if the serverURL passed in is the same as one we have already been using during
    // initialisation, in which case we are continuing a failed partial initialisation. If the
    // serverURL is different, it is either completely fresh, or the URL has been changed so we
    // should start afresh. Do the same for syncSiteName, so that it isn't possible to start syncing
    // data from a site different to what initialisation was previously started with.
    const oldSyncURL = this.serverURL;
    const oldSyncSiteName = this.thisSiteName;
    const isFresh =
      !oldSyncURL || serverURL !== oldSyncURL || !syncSiteName || syncSiteName !== oldSyncSiteName;

    if (isFresh) {
      this.database.write(() => {
        this.database.deleteAll();
      });
    }
    try {
      await this.authenticator.authenticate(serverURL, syncSiteName, syncSitePassword);
      this.refreshSyncParams(); // authenticate sets all the sync settings in database, so refresh

      if (isFresh) {
        // If a fresh initialisation, tell the server to prepare required sync records
        const response = await fetch(
          `${this.serverURL}/sync/v3/initial_dump/` +
            `?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
          {
            headers: {
              Authorization: this.authHeader,
              ...this.extraHeaders,
            },
          },
        );
        if (response.status < 200 || response.status >= 300) {
          throw new Error('Connection failure while attempting to sync.');
        }
        const responseJson = await response.json();
        if (responseJson.error && responseJson.error.length > 0) {
          throw new Error(responseJson.error);
        }
        // If the initial_dump has been successful, serverURL is valid, and should now have all sync
        // records queued and ready to send. Safe to store as this.serverURL
        this.serverURL = serverURL;
      }
      await this.pull();
    } catch (error) {
      // Did not authenticate, sync error, or no internet, pass error up
      this.setError(error.message);
      this.setIsSyncing(false);
      throw error;
    }

    this.settings.set(SYNC_IS_INITIALISED, 'true');
    this.syncQueue.enable(); // Begin the sync queue listening to database changes
    this.setIsSyncing(false);
  };

  /**
   * Return whether the synchroniser has been initialised.
   * @return {boolean} True if initial sync has been completed successfully
   */
  isInitialised = () => {
    const syncIsInitialised = this.settings.get(SYNC_IS_INITIALISED);
    return syncIsInitialised && syncIsInitialised === 'true';
  };

  /**
   * Return whether or not the last sync of the app failed
   * @return {boolean} 'true' if the last call of synchronise failed
   */
  lastSyncFailed = () => {
    const lastSyncFailed = this.settings.get(SYNC_PRIOR_FAILED);
    return lastSyncFailed && lastSyncFailed === 'true';
  };

  /**
   * Carry out a synchronization, first pushing any local changes, then pulling
   * down remote changes and integrating them into the local database.
   * @return {none}
   */
  synchronise = async () => {
    try {
      if (!this.isInitialised()) throw new Error('Not yet initialised');
      this.setIsSyncing(true);
      this.refreshSyncParams();

      // Keeps track between app close/open whether last sync was successful
      this.settings.set(SYNC_PRIOR_FAILED, 'true');

      // Using async/await here means that any errors thrown by push or pull will be caught by the
      // outer try/catch
      await this.push();
      await this.pull();

      // Store persistent sync details in settings
      this.settings.set(SYNC_PRIOR_FAILED, 'false');

      // Store sync completion progress in redux
      this.setIsSyncing(false);
      this.setCompletionTime(new Date().getTime());
    } catch (error) {
      this.setError(error.message);
      this.setIsSyncing(false);
    }
  };

  /**
   * Push batches of changes to the local database up to the remote server, until
   * all local changes have been synced.
   * @return {Promise} Resolves if successful, or passes up any error thrown
   */
  push = async () => {
    this.setProgressMessage('Pushing changes to the server');
    this.setProgress(0);
    this.setTotal(this.syncQueue.length);
    while (this.syncQueue.length > 0) {
      const batchComplete = this.batchSizeAdjustor();
      const recordsToSync = this.syncQueue.next(this.batchSize);
      const translatedRecords = recordsToSync
        .map(this.translateRecord) // Apply map function to get translated records
        .filter(record => !!record); // If error thrown, may be null so filter falsy values out
      await this.pushRecords(translatedRecords);
      // Records that threw errors in translateRecord() are still removed
      this.syncQueue.use(recordsToSync);
      this.incrementProgress(recordsToSync.length);
      batchComplete();
    }
  };

  /**
   * Handles translating records for push() and catching errors
   * @param {object} record The outgoing record to be translated
   * @return {object} The translated record output
   */
  translateRecord = record => {
    try {
      // Try translate the record
      return generateSyncJson(this.database, this.settings, record);
    } catch (error) {
      // If error not safe to continue sync throw it again to pass it up to next handler
      // See outgoingSyncUtils.js
      if (!error.canDeleteSyncOut) throw error;
      return null;
    }
  };

  /**
   * Pushes a collection of records to the remote sync server
   * @param  {array}   records The records to push
   * @return {Promise}         Resolves if successful, or passes up any error thrown
   */
  pushRecords = async records => {
    const response = await fetch(
      `${this.serverURL}/sync/v3/queued_records/` +
        `?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
        body: JSON.stringify(records),
      },
    );
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error('Unexpected response from sync server');
    }
    if (responseJson.error.length > 0) {
      if (responseJson.error.startsWith('Site registration doesn\'t match.')) {
        throw new Error(responseJson.error);
      } else {
        throw new Error('Server rejected pushed records');
      }
    }
  };

  /**
   * Pulls any changes to data on the sync server down to the local database
   * @return {Promise} Resolves if successful, or passes up any error thrown
   */
  pull = async () => {
    let waitingRecordCount = await this.getWaitingRecordCount();
    let total = waitingRecordCount;
    let progress = 0;

    this.setProgressMessage('Pulling changes from the server');
    this.setProgress(progress);
    this.setTotal(total);

    // Pull this.batchSize amount of records at a time from server
    while (progress < total) {
      const batchComplete = this.batchSizeAdjustor();
      // Get a batch of records and integrate them
      const incomingRecords = await this.getIncomingRecords();
      this.integrateRecords(incomingRecords);
      await this.acknowledgeRecords(incomingRecords);
      // Break out if incoming records is actually empty (something weird happened on server API).
      // Basically future proof to not get infinite loop.
      if (incomingRecords.length <= 0) break;
      progress += incomingRecords.length;

      // Check no new records added to incoming queue on last iteration.
      if (progress >= total) {
        waitingRecordCount = await this.getWaitingRecordCount();
        if (waitingRecordCount > 0) {
          total = progress + waitingRecordCount;
          this.setTotal(total);
        }
      }

      this.incrementProgress(incomingRecords.length);
      batchComplete();
    }
  };

  /**
   * Returns the number of records left to pull
   * @return {Promise}           Resolves with the record count, or passes up any error thrown
   */
  getWaitingRecordCount = async () => {
    const response = await fetch(
      `${this.serverURL}/sync/v3/queued_records/count` +
        `?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
      {
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
      },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new Error('Connection failure while attempting to sync.');
    }
    const responseJson = await response.json();
    if (responseJson.error && responseJson.error.length > 0) {
      throw new Error(responseJson.error);
    }
    if (typeof responseJson.NumRecords !== 'number') {
      throw new Error('Unexpected response from server');
    }
    return responseJson.NumRecords;
  };

  /**
   * Returns the next batch of incoming sync records
   * @return {Promise}            Resolves with the records, or passes up any error thrown
   */
  getIncomingRecords = async () => {
    const response = await fetch(
      `${this.serverURL}/sync/v3/queued_records` +
        `?from_site=${this.thisSiteId}&to_site=${this.serverId}&limit=${this.batchSize}`,
      {
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
      },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new Error('Connection failure while pulling sync records.');
    }
    const responseJson = await response.json();
    if (responseJson.error && responseJson.error.length > 0) {
      throw new Error(responseJson.error);
    }
    return responseJson;
  };

  /**
   * Parse the batch of incoming records, and integrate them into the local database
   * @param  {object} syncJson  The json object the server sent to represent records
   * @return {none}
   */
  integrateRecords(syncJson) {
    this.database.write(() => {
      syncJson.forEach(syncRecord => {
        integrateRecord(this.database, this.settings, syncRecord);
      });
    });
  }

  /**
   * Sends the sync server a message to indicate the sync records have been consumed
   * @param  {array}   records    Sync records that have been integrated
   * @return {none}
   */
  acknowledgeRecords = async records => {
    const syncIds = records.map(record => record.SyncID);
    const requestBody = {
      SyncRecordIDs: syncIds,
    };
    const response = await fetch(
      `${this.serverURL}/sync/v3/acknowledged_records` +
        `?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
        body: JSON.stringify(requestBody),
      },
    );
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error('Unexpected response from sync server');
    }
    if (responseJson.error.length > 0) {
      throw new Error(responseJson.error);
    }
  };

  /**
   * Closure for handling adjusting the batch size that sync uses
   * @return {function} A closure function that when called ends timing and adjusts batch size
   */
  batchSizeAdjustor = () => {
    const start = Date.now();
    return () => {
      const timeTaken = (Date.now() - start) / 1000;
      const durationPerRecord = timeTaken / this.batchSize;
      const optimalBatchSize = OPTIMAL_BATCH_SPEED / durationPerRecord;
      let newBatchSize = optimalBatchSize;

      newBatchSize = Math.floor(newBatchSize);
      newBatchSize = Math.max(newBatchSize, MIN_SYNC_BATCH_SIZE);
      newBatchSize = Math.min(newBatchSize, MAX_SYNC_BATCH_SIZE);

      this.batchSize = newBatchSize;
    };
  };
}
