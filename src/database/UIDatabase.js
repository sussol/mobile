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

  addListener(...args) { this.database.addListener(...args); }
  removeListener(...args) { this.database.removeListener(...args); }
  alertListeners(...args) { this.database.alertListeners(...args); }
  create(...args) { this.database.create(...args); }
  delete(...args) { this.database.delete(...args); }
  deleteAll(...args) { this.database.deleteAll(...args); }
  save(...args) { this.database.save(...args); }
  update(...args) { this.database.update(...args); }
  write(...args) { this.database.write(...args); }

}
