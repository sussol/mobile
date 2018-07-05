import RNFS from 'react-native-fs';
import Realm from 'realm';
import { schema } from './schema';

export class UIDatabase {
  constructor(database) {
    this.database = database;
  }

  /**
   * Closes the database, exports the .realm file to android 'Download/mSupplyMobile data'
   * The app will cease to function (crash) if anything tries to access the database while
   * it is closed.
   *
   * This method should perhaps be added to react-native-databse
   */
  exportData(filename = 'msupply-mobile-data') {
    const realm = this.database.realm; // TODO: refactor away from 'database.database.realm'
    const realmPath = realm.path;
    const exportFolder = `${RNFS.ExternalStorageDirectoryPath}/Download/mSupplyMobile_data`;

    const date = new Date();
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}T${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const copyFileName = `${filename} ${dateString}`;

    // If the database is not closed, there is a small chance of corrupting the data
    // if it's currently in a transaction
    realm.close();
    RNFS.mkdir(exportFolder)
      .then(() => RNFS.copyFile(realmPath, `${exportFolder}/${copyFileName}.realm`)
        .catch(() => RNFS.copyFile(realmPath, `${exportFolder}/msupply-mobile-data.realm`))
      )
      .finally(() => { this.database.realm = new Realm(schema); }); // reopen the realm
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    switch (type) {
      case 'CustomerInvoice':
        // Only show invoices generated from requisitions once finalised
        return results.filtered(
          'type == "customer_invoice" AND (linkedRequisition == null OR status == "finalised")',
        );
      case 'SupplierInvoice':
        return results.filtered(
          'type == "supplier_invoice" AND otherParty.type != "inventory_adjustment"',
        );
      case 'Customer':
        return results.filtered('isVisible == true AND isCustomer == true');
      case 'Supplier':
        return results.filtered('isVisible == true AND isSupplier == true');
      case 'InternalSupplier':
        return results.filtered('isVisible == true AND isSupplier == true AND type == "store"');
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

function translateToCoreDatabaseType(type) {
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
}
