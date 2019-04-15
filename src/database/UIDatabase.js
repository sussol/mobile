/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import RNFS from 'react-native-fs';

import { schema } from './schema';
import { SETTINGS_KEYS } from '../settings';

const { THIS_STORE_NAME_ID } = SETTINGS_KEYS;

const translateToCoreDatabaseType = type => {
  switch (type) {
    case 'CustomerInvoice':
    case 'SupplierInvoice':
      return 'Transaction';
    case 'Customer':
    case 'Supplier':
    case 'InternalSupplier':
    case 'ExternalSupplier':
      return 'Name';
    case 'RequestRequisition':
    case 'ResponseRequisition':
      return 'Requisition';
    default:
      return type;
  }
};

export class UIDatabase {
  constructor(database) {
    this.database = database;
  }

  /**
   * Closes the database, exports the realm file to '/Download/mSupplyMobile\ data' on device
   * file system. The app will crash if anything tries to access the database while it is closed.
   */
  exportData(filename = 'msupply-mobile-data') {
    // TO DO: add method to react-native-database.

    const { realm } = this.database;
    const realmPath = realm.path;
    const exportFolder = `${RNFS.ExternalStorageDirectoryPath}/Download/mSupplyMobile_data`;

    const date = new Date();
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}T${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const copyFileName = `${filename} ${dateString}`;

    // If the database is not closed, there is a small chance of corrupting the data if currently in
    // a transaction.
    realm.close();

    RNFS.mkdir(exportFolder)
      .then(() => {
        RNFS.copyFile(realmPath, `${exportFolder}/${copyFileName}.realm`);
        // |copyFileName| is derived from store name. May have invalid characters for filesystem.
      })
      .catch(() => {
        RNFS.copyFile(realmPath, `${exportFolder}/msupply-mobile-data.realm`);
      })
      .finally(() => {
        this.database.realm = new Realm(schema);
      }); // Reopen the realm.
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    const thisStoreNameIdSetting = this.database
      .objects('Setting')
      .filtered('key == $0', THIS_STORE_NAME_ID)[0];
    // |ownStoreIdSetting| will not exist if not initialised.
    const thisStoreNameId = thisStoreNameIdSetting && thisStoreNameIdSetting.value;

    switch (type) {
      case 'CustomerInvoice':
        // Only show invoices generated from requisitions once finalised.
        return results.filtered(
          'type == "customer_invoice" AND (linkedRequisition == null OR status == "finalised")'
        );
      case 'SupplierInvoice':
        return results.filtered(
          'type == "supplier_invoice" AND otherParty.type != "inventory_adjustment"'
        );
      case 'Customer':
        return results.filtered(
          'isVisible == true AND isCustomer == true AND id != $0',
          thisStoreNameId
        );
      case 'Supplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND id != $0',
          thisStoreNameId
        );
      case 'InternalSupplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND type == "store" AND id != $0',
          thisStoreNameId
        );
      case 'ExternalSupplier':
        return results.filtered('isVisible == true AND isSupplier == true AND type == "facility"');
      case 'Item':
        return results.filtered('isVisible == true');
      case 'RequestRequisition':
        return results.filtered('type == "request"');
      case 'ResponseRequisition':
        return results.filtered('serialNumber != "-1" AND type == "response"');
      default:
        return results;
    }
  }

  addListener(...args) {
    return this.database.addListener(...args);
  }

  removeListener(...args) {
    return this.database.removeListener(...args);
  }

  alertListeners(...args) {
    return this.database.alertListeners(...args);
  }

  create(...args) {
    return this.database.create(...args);
  }

  getOrCreate(...args) {
    return this.database.getOrCreate(...args);
  }

  delete(...args) {
    return this.database.delete(...args);
  }

  deleteAll(...args) {
    return this.database.deleteAll(...args);
  }

  save(...args) {
    return this.database.save(...args);
  }

  update(...args) {
    return this.database.update(...args);
  }

  write(...args) {
    return this.database.write(...args);
  }
}

export default UIDatabase;
