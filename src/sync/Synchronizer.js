/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import realmMock from '../database/mockDBInstantiator';
import { authenticationUtils } from '../authentication';
const { hashPassword } = authenticationUtils;


export default class Synchronizer {

  constructor(database) {
    this.database = database;
    this.synchronize = this.synchronize.bind(this);
  }

  initialise(serverURL, syncSiteName, syncSitePassword, onInitialised) {
    this.database.write(() => { this.database.deleteAll(); });

    const passwordHash = hashPassword(syncSitePassword);
    this.database.write(() => {
      this.database.create('Setting', {
        key: 'ServerURL',
        value: serverURL,
      }, true);
      this.database.create('Setting', {
        key: 'SyncSiteName',
        value: syncSiteName,
      }, true);
      this.database.create('Setting', {
        key: 'SyncSitePasswordHash',
        value: passwordHash,
      }, true);
    });
    if (this.database.objects('Item').length === 0) {
      realmMock();
    }
    onInitialised();
  }

  isInitialised() {
    return this.database.objects('Setting').filtered('key = "ServerURL"').length > 0;
  }

  synchronize() {
    if (!this.isInitialised()) return; // Not yet initialised, don't sync
  }

}
