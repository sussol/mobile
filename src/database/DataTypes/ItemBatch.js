/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import { createRecord } from '../utilities';

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
  get isVaccine() {
    return this.item?.isVaccine ?? false;
  }

  get isInBreach() {
    return this.location?.isInBreach() ?? false;
  }

  get currentVvmStatus() {
    return this.vaccineVialMonitorStatusLogs.sorted('timestamp', true)[0];
  }

  get vvmStatusName() {
    return this.currentVvmStatus?.description ?? '';
  }

  get otherPartyName() {
    return this.supplier?.name || '';
  }

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
   * @return  {Date}
   */
  get addedDate() {
    return (
      this.transactionBatches
        .filtered('transaction.type == $0 && transaction.status != $1', 'supplier_invoice', 'new')
        .sorted('transaction.confirmDate', false)[0]?.transaction?.confirmDate ?? new Date()
    );
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

  get itemCode() {
    return this?.item?.code ?? '';
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
   * Add a transaction batch to be associated with this batch.
   *
   * @param  {TransactionBatch}  transactionBatch
   */
  addTransactionBatch(transactionBatch) {
    this.transactionBatches.push(transactionBatch);
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
   * @param  {VaccineVialMonitorStatus} newVvmStatus
   * @return {Bool} Indicator whether the new vvm status should be applied to this batch.
   */
  shouldApplyVvmStatus(newVvmStatus) {
    const { id: newStatusId } = newVvmStatus;
    const { id: currentStatusId } = this.currentVvmStatus;

    return newStatusId !== currentStatusId;
  }

  /**
   * @param  {Location} newLocation
   * @return {Bool} Indicator whether the new location should be applied to this batch.
   */
  shouldApplyLocation(newLocation) {
    const { id: newLocationId } = newLocation;
    const { id: currentLocationId } = this.location;

    return newLocationId !== currentLocationId;
  }

  applyLocation(database, newLocation) {
    if (!this.shouldApplyLocation(newLocation)) return null;

    this.location = newLocation;

    return createRecord(database, 'LocationMovement', this, newLocation);
  }

  applyVvmStatus(database, newVvmStatus) {
    return this.shouldApplyVvmStatus(newVvmStatus)
      ? createRecord(database, 'VaccineVialMonitorStatusLog', this, newVvmStatus)
      : null;
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
    locationMovements: {
      type: 'linkingObjects',
      objectType: 'LocationMovement',
      property: 'itemBatch',
    },
    doses: { type: 'double', default: 0 },
    vaccineVialMonitorStatusLogs: {
      type: 'linkingObjects',
      objectType: 'VaccineVialMonitorStatusLog',
      property: 'itemBatch',
    },
  },
};

export default ItemBatch;
