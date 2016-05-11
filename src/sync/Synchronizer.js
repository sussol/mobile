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
  }

  synchronize() {
    if (!this.isInitialised()) return; // Not yet initialised, don't sync
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

  _getAllItems() {
    const requestMetadata = {
      method: 'GET',
      headers: {
        Authorization: 'Basic U3Vzc29sOmthdGhtYW5kdTMxMg==',
      },
    };

    const requestURL = REQUEST_URL;
    fetch(requestURL, requestMetadata)
      .then((response) => response.json())
      .then((responseData) => {
        this.database.write(() => {
          for (item of responseData) {
            this.database.create('Item', {
              id: item.id,
              code: item.code,
              name: item.item_name,
              defaultPackSize: item.default_pack_size,
              stockOnHand: item.stock_on_hand_tot
            }, true); // true param allows for updating objects at existing ids (primary key)
          }
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .done();
  }

}
