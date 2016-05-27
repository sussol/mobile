/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { instantiate as realmMock } from '../database/mockDBInstantiator';
import { SyncQueue } from './SyncQueue';
import { generateSyncJson } from './generateSyncJson';
import { parseSyncJson } from './parseSyncJson';
import { SETTINGS_KEYS } from '../settings';
const {
  SYNC_SERVER_ID,
  SYNC_SITE_ID,
  SYNC_URL,
} = SETTINGS_KEYS;

const SIZE_OF_SYNC_BATCH = 1; // Number of records to sync at one time
const MOCK = true;

export class Synchronizer {

  constructor(database, authenticator, settings) {
    this.database = database;
    this.authenticator = authenticator;
    this.settings = settings;
    this.syncQueue = new SyncQueue(database);
    this.synchronize = this.synchronize.bind(this);
    if (this.isInitialised()) this.syncQueue.enable();
  }

  /**
   * Wipe the current database, check that the given url can be synced against
   * using the given name and password, and if so populate the database by pulling
   * from the remote server.
   * @param  {string} serverURL        The URL to be synced against
   * @param  {string} syncSiteName     The username to use in sync auth
   * @param  {string} syncSitePassword The password to use in sync auth
   * @return {Promise}                 Resolve if successfully authenticated and
   *                                   initialised, otherwise reject with error
   */
  async initialise(serverURL, syncSiteName, syncSitePassword) {
    this.syncQueue.disable(); // Stop sync queue listening to database changes
    this.database.write(() => { this.database.deleteAll(); });
    try {
      await this.authenticator.authenticate(serverURL, syncSiteName, syncSitePassword);
      if (MOCK) realmMock(this.database); // Instantiate mock db
      else await this.pull();
    } catch (error) { // Did not authenticate or internet failed, wipe db and pass error up
      this.database.write(() => { this.database.deleteAll(); });
      throw new Error(error);
    }
    this.syncQueue.enable(); // Begin the sync queue listening to database changes
  }

  /**
   * Return whether or not the synchronizer has been initialised with a URL to sync
   * against.
   * @return {Boolean} Whether the synchronizer is initialised
   */
  isInitialised() {
    return this.settings.get(SYNC_URL).length > 0;
  }

  /**
   * Carry out a synchronization, first pushing any local changes, then pulling
   * down remote changes and integrating them into the local database.
   * @return {[type]} [description]
   */
  async synchronize() {
    if (!this.isInitialised()) throw new Error('Not yet initialised');
    // Using async/await here means that any errors thrown by push or pull
    // will be passed up as a rejection of the promise returned by synchronize
    await this.push();
    await this.pull();
  }

  /**
   * Push batches of changes to the local database up to the remote server, until
   * all local changes have been synced.
   * @return {Promise} Resolves if successful, or passes up any error thrown
   */
  async push() {
    let recordsToSync;
    let translatedRecords;
    while (this.syncQueue.length() > 0) {
      recordsToSync = this.syncQueue.next(SIZE_OF_SYNC_BATCH);
      translatedRecords = recordsToSync.map((record) => generateSyncJson(this.database, record));
      await this.pushRecords(translatedRecords);
      this.syncQueue.use(recordsToSync);
    }
  }

  /**
   * Pushes a collection of records to the remote sync server
   * @param  {array}   records The records to push
   * @return {Promise}         Resolves if successful, or passes up any error thrown
   */
  pushRecords(records) {
    const serverURL = this.settings.get(SYNC_URL);
    const fromSiteId = this.settings.get(SYNC_SITE_ID);
    const toSiteId = this.settings.get(SYNC_SERVER_ID);
    return Promise.all(records.map((record) => fetch(
      `${serverURL}/sync/v2/queued_records/?from_site=${fromSiteId}&to_site=${toSiteId}`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authenticator.getAuthHeader(),
        },
        body: JSON.stringify(record),
      })
    ));
  }

  pull() {
    const serverURL = this.settings.get(SYNC_URL);
  }

}
