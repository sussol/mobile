/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { instantiate as realmMock } from '../database/mockDBInstantiator';
import { SyncQueue } from './SyncQueue';

export class Synchronizer {

  constructor(database, authenticator) {
    this.database = database;
    this.authenticator = authenticator;
    this.syncQueue = new SyncQueue(database);
    this.synchronize = this.synchronize.bind(this);
    if (this.isInitialised()) this.syncQueue.enable();
  }

  initialise(serverURL, syncSiteName, syncSitePassword) {
    return new Promise((resolve, reject) => {
      this.database.write(() => { this.database.deleteAll(); });
      this.authenticator.authenticate(serverURL, syncSiteName, syncSitePassword)
        .then(() => { // Successfully authenticated
          realmMock(this.database); // Initialise using mock db
          this.syncQueue.enable();
          resolve();
        }, (error) => { // Did not authenticate
          reject(error);
        }
      );
    });
  }

  isInitialised() {
    return this.database.objects('Setting').filtered('key = "ServerURL"').length > 0;
  }

  synchronize() {
    if (!this.isInitialised()) return; // Not yet initialised, don't sync
    this.push();
    this.pull();
  }

  push() {
  }

  pull() {

  }

}
