export class UIDatabase {

  constructor(database) {
    this.database = database;
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    switch (type) {
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

  addListener(...args) { return this.database.addListener(...args); }
  removeListener(...args) { return this.database.removeListener(...args); }
  alertListeners(...args) { return this.database.alertListeners(...args); }
  create(...args) { return this.database.create(...args); }
  delete(...args) { return this.database.delete(...args); }
  deleteAll(...args) { return this.database.deleteAll(...args); }
  save(...args) { return this.database.save(...args); }
  update(...args) { return this.database.update(...args); }
  write(...args) { return this.database.write(...args); }

}

function translateToCoreDatabaseType(type) {
  switch (type) {
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
