/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import realm from '../schema/Realm';
import realmMock from '../schema/mockDBInstantiator'

let REQUEST_URL = 'http://192.168.4.111:8088/mobile/item?item_name=@';

export default class Datastore {

  synchronize() {
    if (realm.objects('Item').length === 0) {
      realmMock();
    }

  //  this._getAllItems();
  }

  _getAllItems() {
    let requestMetadata = {
      method: 'GET',
      headers: {
        'Authorization' : 'Basic U3Vzc29sOmthdGhtYW5kdTMxMg==',
      },
    }

    let requestURL = REQUEST_URL;
    fetch(requestURL, requestMetadata)
      .then((response) => response.json())
      .then((responseData) => {
        realm.write(() => {
            for(item of responseData) {
              realm.create('Item', {
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
