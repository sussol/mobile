/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import realmMock from '../database/mockDBInstantiator';

export default class Synchronizer {

  constructor(database, authenticator) {
    this.database = database;
    this.authenticator = authenticator;
    this.synchronize = this.synchronize.bind(this);
  }

  initialise(serverURL, syncSiteName, syncSitePassword) {
    return new Promise((resolve, reject) => {
      this.database.write(() => { this.database.deleteAll(); });

      this.authenticator.authenticate(serverURL, syncSiteName, syncSitePassword)
        .then(() => { // Successfully authenticated
          realmMock(); // Initialise using mock db
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
  }

}
