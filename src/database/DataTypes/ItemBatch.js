/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { getTotal } from '../utilities';

/**
 * A batch of items.
 *
 * @property  {string}                   id
 * @property  {Item}                     item
 * @property  {number}                   packSize
 * @property  {number}                   numberOfPacks
 * @property  {Date}                     expiryDate
 * @property  {string}                   batch
 * @property  {number}                   costPrice
 * @property  {number}                   sellPrice
 * @property  {Name}                     supplier
 * @property  {Name}                     donor
 * @property  {List.<TransactionBatch>}  transactionBatches
 */
export class ItemBatch extends Realm.Object {
  /**
   * Get the total number of items in this batch.
   *
   * @returns  {number}
   */
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  /**
   * Get the date this batch was added, equivalent to the confirm date
   * of the earliest transaction batch this batch is associated with.
   *
   * @return  {Date}
   */
  get addedDate() {
    if (this.transactionBatches.length === 0) return new Date();
    const transactionBatches = this.transactionBatches.slice();
    const sortedTransactionBatches = transactionBatches.sort(
      (a, b) => a.transaction.confirmDate < b.transaction.confirmDate
    );
    return sortedTransactionBatches[0].transaction.confirmDate;
  }

  /**
   * Get the id of the item this batch is associated with.
   *
   * @return  {string}
   */
  get itemId() {
    return this.item ? this.item.id : '';
  }

  /**
   * Get the name of the item this batch is associated with.
   *
   * @return  {string}
   */
  get itemName() {
    return this.item ? this.item.name : '';
  }

  /**
   * Set the total number of items in this batch.
   *
   * @param  {number}  quantity  The total number of items in this batch, expressed as
   *                             the product of the number of packs associated with the
   *                             batch and the number of items contained in each pack.
   */
  set totalQuantity(quantity) {
    if (quantity < 0) {
      throw new Error('Cannot set a negative item batch quantity');
    }
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  /**
   * Get the sum of all usage in each transaction batch related to this item
   * batch within a starting and ending date.
   *
   * @param   {Date}    startDate
   * @param   {Date}    endDate
   * @return  {number}
   */
  totalUsageForPeriod(startDate, endDate) {
    const transactionBatches = this.transactionBatches.filtered(
      'transaction.confirmDate >= $0 && transaction.confirmDate <= $1',
      startDate,
      endDate
    );

    return getTotal(transactionBatches, 'usage');
  }

  /**
   * Add a transaction batch to be associated with this batch.
   *
   * @param  {TransactionBatch}  transactionBatch
   */
  addTransactionBatch(transactionBatch) {
    this.transactionBatches.push(transactionBatch);
  }

  /**
   * Add a sensor log to be associated with this batch.
   * @param {SensorLog} sensorLog
   */
  addSensorLog(sensorLog) {
    this.sensorLogs.push(sensorLog);
  }

  /**
   * Add a transaction batch to be associated with this batch, if not
   * already added.
   *
   * @param  {TransactionBatch}  transactionBatch
   */
  addTransactionBatchIfUnique(transactionBatch) {
    if (this.transactionBatches.filtered('id == $0', transactionBatch.id).length > 0) return;
    this.addTransactionBatch(transactionBatch);
  }

  /**
   * Get string representation of batch.
   *
   * @return  {string}
   */
  toString() {
    return `${this.itemName} - Batch ${this.batch}`;
  }

  /**
   * Returns all SensorLog objects related to this ItemBatch
   * which has recorded a breach.
   */
  get breaches() {
    return this.sensorLogs.filtered('isInBreach = $0', true);
  }

  /**
   * Returns if this ItemBatch has been in a breach.
   */
  get hasBreached() {
    return this.breaches.length > 0;
  }

  /**
   * Returns an object { maxTemperature, minTemperature } for all
   * temperatures recorded for this item batch
   */
  get temperatureExposure() {
    return {
      minTemperature: this.sensorLogs.min('temperature') || Infinity,
      maxTemperature: this.sensorLogs.max('temperature') || -Infinity,
    };
  }

  /**
   * Returns an object { maxTemperature, minTemperature } for all
   * temperatures recorded for this item batch in a given
   * location.
   * @param {Location} location
   * @param {Location.id} LocationId
   */
  getTemperatureExposureInLocation({ id: locationId } = {}) {
    return {
      minTemperature:
        this.sensorLogs.filtered('location.id = $0', locationId).min('temperature') || Infinity,
      maxTemperature:
        this.sensorLogs.filtered('location.id = $0', locationId).max('temperature') || -Infinity,
    };
  }
}

ItemBatch.schema = {
  name: 'ItemBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: { type: 'Item', optional: true },
    packSize: { type: 'double', default: 1 },
    numberOfPacks: { type: 'double', default: 0 },
    expiryDate: { type: 'date', optional: true },
    batch: { type: 'string', default: '' },
    costPrice: { type: 'double', default: 0 },
    sellPrice: { type: 'double', default: 0 },
    supplier: { type: 'Name', optional: true },
    donor: { type: 'Name', optional: true },
    transactionBatches: { type: 'list', objectType: 'TransactionBatch' },
    location: { type: 'Location', optional: true },
    sensorLogs: { type: 'list', objectType: 'SensorLog' },
  },
};

export default ItemBatch;
