import Realm from 'realm';
import { generateUUID } from './utilities';
import { CHANGE_TYPES } from './index.js';

export class Database {

  /**
   * Create a new database with the given schema.
   * @param  {object} schema Contains a schema and a schemaVersion, in the format
   *                         expected by Realm
   * @return {none}
   */
  constructor(schema) {
    this.realm = new Realm(schema);
    this.listeners = new Map();
  }

  /**
   * Adds a function to the array of functions to call when the database changes.
   * @param {Function} callback Function to call when a change is made to the
   *                            database. Should expect a change type, record type,
   *                            and an object representing the record pre-change.
   * @return {string}          The id of the callback being added
   */
  addListener(callback) {
    const id = generateUUID();
    this.listeners.set(id, callback);
    return id;
  }

  /**
   * Removes the callback with the specified id, if it exists
   * @param  {string} id Id of the callback to remove
   * @return {none}
   */
  removeListener(id) {
    this.listeners.delete(id);
  }

  /**
   * Calls each callback in the array of listeners with the provided arguments.
   * @param  {array} ...args The arguments to pass on to each callback
   * @return {none}
   */
  alertListeners(...args) {
    this.listeners.forEach((callback) => callback(...args));
  }

  /**
   * Creates and returns an object of the given type in the database with the
   * specified properties. Fails if there is a clashing primary key.
   * @param  {string} type       Database object type being updated
   * @param  {object} properties The properties for the database object
   * @return {Realm.Object}      The database object that was created
   */
  create(type, properties) {
    const object = this.realm.create(type, properties);
    this.alertListeners(CHANGE_TYPES.CREATE, type, object);
    return object;
  }

  /**
   * Deletes a specific object from the database.
   * @param  {Realm.Object} object Object to be deleted
   * @return {none}
   */
  delete(type, object) {
    const objects = objects instanceof Array ? object : [object];
    objects.forEach(obj => {
      const record = { ...obj };
      this.realm.delete(obj);
      this.alertListeners(CHANGE_TYPES.DELETE, type, record);
    });
  }

  /**
   * Deletes all objects from the database.
   * @return {none}
   */
  deleteAll() {
    this.realm.deleteAll();
    this.alertListeners(CHANGE_TYPES.WIPE);
  }

  /**
   * Returns all objects of the given type in the database.
   * @param  {string}        type Database object type being queried
   * @return {Realm.Results}      A results object containing all objects of the
   *                              given type.
   */
  objects(type) {
    return this.realm.objects(type);
  }

  /**
   * This method should always be called after a realm object is edited directly
   * by setting properties using dot notation. It is a bit of a hack to make sure
   * listeners are notified of the database update, and will be replaced in future.
   * @param  {string} type       Database object type being updated
   * @param  {object} object     The edited datbase object
   * @return {none}
   */
  save(type, object) {
    this.alertListeners(CHANGE_TYPES.UPDATE, type, object);
  }

  /**
   * Updates an item already in the database, with the primary key matching
   * that passed in with the properties. If none exists, will create a new
   * object. Also notifies listeners of the database update.
   * @param  {string} type       Database object type being updated
   * @param  {object} properties The new properties for the database object
   * @return {Realm.Object}      The database object that was updated or created
   */
  update(type, properties) {
    const object = this.realm.create(type, properties, true);
    this.alertListeners(CHANGE_TYPES.UPDATE, type, object);
    return object;
  }

  /**
   * Synchronously call the provided callback inside a database write transaction.
   * @param  {function} callback The callback to execute within the transaction
   * @return {none}
   */
  write(callback) {
    this.realm.write(callback);
  }
}
