/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Implements the same as the core database, but ensures any database changes made
 * through this class call database change listeners with the extra parameter |sync|,
 * indicating the change was caused by the sync system.
 */
export class SyncDatabase {
  /**
   * Hold reference to core database (not subclass) to ensure change listeners are always
   * used consistently.
   */
  constructor(database) {
    this.database = database;
  }

  /**
   * For create, delete, update and save, pass in the extra parameter |sync| to be
   * passed through to database listeners as the cause of database change.
   */
  create(...args) {
    return this.database.create(...args, 'sync');
  }

  get(type, primaryKey, primaryKeyField = 'id') {
    return this.database.get(type, primaryKey, primaryKeyField);
  }

  getOrCreate(type, primaryKey, primaryKeyField = 'id') {
    return this.database.getOrCreate(type, primaryKey, primaryKeyField, 'sync');
  }

  delete(...args) {
    return this.database.delete(...args, 'sync');
  }

  save(...args) {
    return this.database.save(...args, 'sync');
  }

  update(...args) {
    return this.database.update(...args, 'sync');
  }

  /**
   * Other methods will not trigger listeners (except alertListeners). Call directly.
   */
  addListener(...args) {
    return this.database.addListener(...args);
  }

  objects(...args) {
    return this.database.objects(...args);
  }

  removeListener(...args) {
    return this.database.removeListener(...args);
  }

  alertListeners(...args) {
    return this.database.alertListeners(...args);
  }

  deleteAll(...args) {
    return this.database.deleteAll(...args);
  }

  write(...args) {
    return this.database.write(...args);
  }
}

export default SyncDatabase;
