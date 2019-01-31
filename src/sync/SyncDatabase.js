/**
 * Implements the same  as the core database, but ensures any database changes made
 * through this class call database change listeners with the extra parameter 'sync',
 * indicating the change was caused by the sync system.
 */
export class SyncDatabase {
  /**
   * Need to hold on to instance of the core database, so that we have all the same
   * change listeners as anyone else using the db (i.e. we can't subclass Database)
   */
  constructor(database) {
    this.database = database;
  }

  /**
   * For create, delete, update and save, pass in the extra parameter 'sync' to be
   * passed through to database listeners as the cause of database change
   */
  create(...args) { return this.database.create(...args, 'sync'); }

  getOrCreate(type, primaryKey, primaryKeyField = 'id') {
    return this.database.getOrCreate(type, primaryKey, primaryKeyField, 'sync');
  }

  delete(...args) { return this.database.delete(...args, 'sync'); }

  save(...args) { return this.database.save(...args, 'sync'); }

  update(...args) { return this.database.update(...args, 'sync'); }

  /**
   * Other methods, just call directly. They won't trigger listeners by
   * themselves (except alertListeners).
   */
  addListener(...args) { return this.database.addListener(...args); }

  objects(...args) { return this.database.objects(...args); }

  removeListener(...args) { return this.database.removeListener(...args); }

  alertListeners(...args) { return this.database.alertListeners(...args); }

  deleteAll(...args) { return this.database.deleteAll(...args); }

  write(...args) { return this.database.write(...args); }
}
