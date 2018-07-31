export class UIDatabase {

  constructor(database) {
    this.database = database;
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    switch (type) {
      case 'CustomerInvoice':
        // Only show invoices generated from requisitions once finalised
        return results.filtered('type == "customer_invoice"'
                                + ' AND (linkedRequisition == null OR status == "finalised")');
      case 'SupplierInvoice':
        return results.filtered('type == "supplier_invoice"'
                                + ' AND otherParty.type != "inventory_adjustment"');
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

  delete(type, records, ...rest) {
    let safeRecordsToDelete;
    let errorMessage;
    switch (type) {
      case 'Transaction':
        safeRecordsToDelete = records.filtered('status != "finalised"');
        errorMessage = count => `Blocked deleting ${count} transaction records`;
        break;
      default:
        break;
    }
    this.database.delete(type, safeRecordsToDelete, ...rest);

    // Throw an error if someone managed to try deleting records they should be able to delete
    const recordCountDiff = records.length - safeRecordsToDelete.length;
    if (!recordCountDiff) {
      throw new Error(errorMessage(recordCountDiff));
    }
  }

  addListener(...args) { return this.database.addListener(...args); }
  removeListener(...args) { return this.database.removeListener(...args); }
  alertListeners(...args) { return this.database.alertListeners(...args); }
  create(...args) { return this.database.create(...args); }
  getOrCreate(...args) { return this.database.getOrCreate(...args); }
  deleteAll(...args) { return this.database.deleteAll(...args); }
  save(...args) { return this.database.save(...args); }
  update(...args) { return this.database.update(...args); }
  write(...args) { return this.database.write(...args); }

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
