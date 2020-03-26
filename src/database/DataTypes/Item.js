/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { UIDatabase } from '..';

import { generalStrings } from '../../localization';
import { getTotal } from '../utilities';
import { dailyUsage } from '../../utilities/dailyUsage';

/**
 * An item.
 *
 * @property  {string}            id
 * @property  {string}            code
 * @property  {string}            name
 * @property  {number}            defaultPackSize
 * @property  {List.<ItemBatch>}  batches
 * @property  {ItemDepartment}    department
 * @property  {string}            description
 * @property  {ItemCategory}      category
 * @property  {number}            defaultPrice
 * @property  {boolean}           isVisible
 * @property  {Item}              crossReferenceItem
 */
export class Item extends Realm.Object {
  /**
   * Delete all item store joins and item batches associated with this master list.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // Clean up item store joins referencing deleted item.
    const itemStoreJoins = database.objects('ItemStoreJoin').filtered('itemId == $0', this.id);
    database.delete('ItemStoreJoin', itemStoreJoins);

    // In case of merge-deletion, ensure only delete batches currently associated with this item.
    this.batches = database.objects('ItemBatch').filtered('item.id == $0', this.id);
    database.delete('ItemBatch', this.batches);
  }

  /**
   * If item is cross-referenced item, return the referenced item, else return this item.
   *
   * @return  {Item}
   */
  get realItem() {
    return this.crossReferenceItem ? this.crossReferenceItem : this;
  }

  /**
   * Get total amount of item.
   *
   * @return  {number}
   */
  get totalQuantity() {
    return getTotal(this.realItem.batches, 'totalQuantity');
  }

  /**
   * Returns an indicator if this item has stock on hand, or not.
   *
   * @return {number}
   */
  get hasStock() {
    return this.totalQuantity > 0;
  }

  /**
   * Get daily usage of item.
   *
   * @return  {number}
   */
  get dailyUsage() {
    return dailyUsage(this);
  }

  /**
   * Get the date the item was added, defined as date of the earliest added batch associated
   * with this item.
   * @return  {Date}
   */
  get addedDate() {
    return this.batches.reduce(
      (acc, { addedDate }) => (acc > addedDate ? addedDate : acc),
      new Date()
    );
  }

  /**
   * Get the batch associated with this item with the earliest expiration date.
   *
   * @return  {ItemBatch}
   */
  get earliestExpiringBatch() {
    // If no batches associated with this item, return null.
    if (this.batches.length === 0) return null;

    let earliestBatch = this.batches.find(batch => batch.totalQuantity > 0);

    // If no batches found with any items, return null.
    if (!earliestBatch) return null;

    this.batches.forEach(batch => {
      if (
        batch.totalQuantity > 0 &&
        batch.expiryDate &&
        (!earliestBatch.expiryDate || batch.expiryDate < earliestBatch.expiryDate)
      ) {
        earliestBatch = batch;
      }
    });

    return earliestBatch;
  }

  /**
   * Get category of item, or empty string if no category exists.
   *
   * @return  {string}
   */
  get categoryName() {
    return this.category ? this.category.name : '';
  }

  /**
   * Get name of department associated with item, or empty string if no department exists.
   *
   * @return  {string}
   */
  get departmentName() {
    return this.department ? this.department.name : '';
  }

  /**
   * Get batches associated with item that have stock.
   *
   * @return  {List}
   */
  get batchesWithStock() {
    return this.batches.filtered('numberOfPacks > 0');
  }

  /**
   * @return {Number} this items monthly usage based on a 30 day month.
   */
  get monthlyUsage() {
    return this.dailyUsage * 30;
  }

  /**
   * Get number of batches associated with item that have stock.
   *
   * @return  {number}
   */
  get totalBatchesInStock() {
    return this.batchesWithStock.length;
  }

  /**
   * Returns a string representing the units for this item.
   * @return {string} the unit for this item, or N/A if none has been assigned.
   */
  get unitString() {
    return this.unit?.units ?? generalStrings.not_available;
  }

  /**
   * Add batch to item.
   *
   * @param  {ItemBatch}  itemBatch
   */
  addBatch(itemBatch) {
    this.batches.push(itemBatch);
  }

  /**
   * Add batch to item if not already added.
   *
   * @param  {ItemBatch}  itemBatch
   */
  addBatchIfUnique(itemBatch) {
    if (this.batches.filtered('id == $0', itemBatch.id).length > 0) return;
    this.addBatch(itemBatch);
  }

  /**
   * Returns an array of all direction expansions related to this
   * item.
   */
  getDirectionExpansions = database =>
    this.directions.sorted('priority').reduce((acc, value) => {
      const expansion = value.getExpansion(database);
      if (expansion) return [...acc, expansion];
      return acc;
    }, []);

  /**
   * Get string representation of item.
   *
   * @returns  {string}
   */
  toString() {
    return `${this.code} - ${this.name}`;
  }

  /**
   * Stock on date
   *
   * @param {Date} date
   * @return  {number}
   */
  geTotalQuantityOnDate(date) {
    if (date >= new Date()) return this.totalQuantity;

    const allMovements = UIDatabase.objects('TransactionBatch')
      .filtered('itemBatch.item.id == $0', this.id)
      .filtered('numberOfPacks > 0')
      .filtered('transaction.confirmDate > $0', date);

    const sumMovements = movements =>
      movements.reduce((sum, { totalQuantity }) => sum + totalQuantity, 0);
    const additions = sumMovements(allMovements.filtered('type == $0', 'stock_in'));
    const reductions = sumMovements(allMovements.filtered('type == $0', 'stock_out'));

    return this.totalQuantity + reductions - additions;
  }
}

Item.schema = {
  name: 'Item',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: { type: 'string', default: 'placeholderCode' },
    name: { type: 'string', default: 'placeholderName' },
    defaultPackSize: { type: 'double', default: 1 },
    batches: { type: 'list', objectType: 'ItemBatch' },
    department: { type: 'ItemDepartment', optional: true },
    description: { type: 'string', optional: true },
    category: { type: 'ItemCategory', optional: true },
    defaultPrice: { type: 'double', default: 0 },
    isVisible: { type: 'bool', default: false },
    crossReferenceItem: { type: 'Item', optional: true },
    unit: { type: 'Unit', optional: true },
    defaultRestrictedLocationType: { type: 'LocationType', optional: true },
    directions: { type: 'linkingObjects', objectType: 'ItemDirection', property: 'item' },
    dosesPerVial: { type: 'double', default: 0 },
    isVaccine: { type: 'bool', default: false },
  },
};

export default Item;
