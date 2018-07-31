import { SETTINGS_KEYS } from '../settings';
const { THIS_STORE_NAME_ID } = SETTINGS_KEYS;

export class UIDatabase {
  constructor(database) {
    this.database = database;
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    const thisStoreIdSetting = this.database
      .objects('Setting')
      .filtered('key == $0', THIS_STORE_NAME_ID)[0];
    // Check ownStoreIdSetting exists, won't if not initialised
    const thisStoreNameId = thisStoreIdSetting && thisStoreIdSetting.value;

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
        return results.filtered(
          'isVisible == true AND isCustomer == true AND id != $0',
          thisStoreNameId,
        );
      case 'Supplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND id != $0',
          thisStoreNameId,
        );
      case 'InternalSupplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND type == "store" AND id != $0',
          thisStoreNameId,
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
