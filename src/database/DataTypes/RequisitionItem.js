/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { Requisition } from './Requisition';
import { parsePositiveInteger } from '../../utilities';

/**
 * A requisition item (i.e. a requisition line).
 *
 * @property  {string}       id
 * @property  {Requisition}  requisition
 * @property  {Item}         item
 * @property  {number}       stockOnHand
 * @property  {number}       dailyUsage
 * @property  {number}       imprestQuantity
 * @property  {number}       requiredQuantity
 * @property  {number}       suppliedQuantity
 * @property  {string}       comment
 * @property  {number}       sortIndex
 */
export class RequisitionItem extends Realm.Object {
  /**
   * Calculates if this items current stock is less then the supplied
   * threshold
   * @return {bool} true if this item has total quantity of stock less than the threshold
   */
  get isLessThanThresholdMOS() {
    return this.stockOnHand < this.dailyUsage * 30 * this.requisition.thresholdMOS;
  }

  /**
   * Get id of requisition item.
   *
   * @return  {string}
   */
  get itemId() {
    return this.item ? this.item.id : '';
  }

  /**
   * Get code of requisition item.
   *
   * @return  {string}
   */
  get itemCode() {
    return this.item ? this.item.code : '';
  }

  /**
   * Get name of requisition item.
   *
   * @return  {string}
   */
  get itemName() {
    return this.item ? this.item.name : '';
  }

  /**
   * Get id of requisition.
   *
   * @return  {string}
   */
  get requisitionId() {
    return this.requisition ? this.requisition.id : '';
  }

  /**
   * Get monthly usage of requisition.
   *
   * @return  {number}
   */
  get monthlyUsage() {
    return this.dailyUsage * 30;
  }

  /**
   * Get the suggested quantity for this requisition item based on expected usage.
   *
   * @return  {number}
   */
  get suggestedQuantity() {
    const daysToSupply = this.requisition ? this.requisition.daysToSupply : 0;
    return Math.ceil(Math.max(this.dailyUsage * daysToSupply - this.stockOnHand, 0));
  }

  /**
   * Get transaction item linked to this requisition item.
   *
   * @return  {TransactionItem}
   */
  get linkedTransactionItem() {
    if (this.requisition.isRequest) return null;
    return (
      this.requisition.linkedTransaction &&
      this.requisition.linkedTransaction.items.filtered('item.id == $0', this.item.id)[0]
    );
  }

  /**
   * Get stock in hand, defined as the available or total quantity of the item associated with
   * this requisition item.
   *
   * @return  {number}
   */
  get ourStockOnHand() {
    const totalQuantity = this.item ? this.item.totalQuantity : null;
    const availableQuantity = this.linkedTransactionItem
      ? this.linkedTransactionItem.availableQuantity
      : null;

    return availableQuantity || totalQuantity;
  }

  /**
   * Gets the unit string for this requisition items related item.
   * @return {string}
   */
  get itemUnit() {
    return this.item.unitString;
  }

  /**
   * Set supplied quantity of this requisition item.
   *
   * @param  {Realm}   database
   * @param  {number}  newValue
   */
  setSuppliedQuantity(database, newValue) {
    // TODO: this.requisition is optional, unhandled possible TypeError.
    if (this.requisition.isFinalised || this.requisition.isRequest) {
      throw new Error('Cannot set supplied quantity for Finalised or Request Requisition');
    }

    const transactionItem = this.linkedTransactionItem;
    if (!transactionItem) return;

    // Update quantity of associated transaction item.
    transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue));
    database.save('TransactionItem', transactionItem);

    // Update quantity of this requisition item.
    this.suppliedQuantity = transactionItem.totalQuantity;
    database.save('RequisitionItem', this);
  }
}

RequisitionItem.schema = {
  name: 'RequisitionItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    requisition: { type: 'Requisition', optional: true },
    item: { type: 'Item', optional: true },
    stockOnHand: { type: 'double', default: 0 },
    dailyUsage: { type: 'double', optional: true },
    imprestQuantity: { type: 'double', optional: true },
    requiredQuantity: { type: 'double', optional: true },
    suppliedQuantity: { type: 'double', optional: true },
    comment: { type: 'string', optional: true },
    sortIndex: { type: 'int', optional: true },
    option: { type: 'Options', optional: true },
  },
};

export default Requisition;
