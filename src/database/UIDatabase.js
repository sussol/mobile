/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import RNFS from 'react-native-fs';

import { SETTINGS_KEYS } from '../settings';
import { formatDate, requestPermission } from '../utilities';

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
  async exportData(filename = 'msupply-mobile-data') {
    const { realm } = this.database;
    const realmPath = realm.path;
    const exportFolder = `${RNFS.ExternalStorageDirectoryPath}/Download/mSupplyMobile_data`;
    const copyFileName = `${filename}${formatDate(new Date(), 'dashes')}`;

    const permissionParameters = {
      permissionType: 'WRITE_EXTERNAL_STORAGE',
      message: 'Export database',
    };

    const { success } = await requestPermission(permissionParameters);

    let error;

    if (success) {
      if (!realm.isInTransaction) {
        await RNFS.mkdir(exportFolder);
        await RNFS.copyFile(realmPath, `${exportFolder}/${copyFileName}.realm`);
      } else error = { code: 'ERROR_IN_TRANSACTION', message: 'Database is in a transaction' };
    } else error = { code: 'ERROR_NO_PERMISSION', message: 'Storage permission not granted' };

    return { success, error };
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
