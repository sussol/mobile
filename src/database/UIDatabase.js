export class UIDatabase {

  constructor(database) {
    this.database = database;
  }

  objects(type) {
    let results = this.database.objects(type);
    switch (type) {
      case 'Item':
        results = results.filtered('isVisible == true');
        break;
      case 'Name':
        results = results.filtered('isVisible == TRUE');
        break;
      default:
        break;
    }
    return results;
  }

  getCustomersOfStore(storeId) {
    return this.objects('Name')
               .filtered('isCustomer == true AND supplyingStoreId == $0', storeId);
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
