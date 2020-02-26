/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A name.
 *
 * @property  {string}              id
 * @property  {string}              name
 * @property  {string}              code
 * @property  {string}              phoneNumber
 * @property  {Address}             billingAddress
 * @property  {string}              emailAddress
 * @property  {string}              type
 * @property  {boolean}             isCustomer
 * @property  {boolean}             isSupplier
 * @property  {boolean}             isManufacturer
 * @property  {List.<MasterList>}   masterLists
 * @property  {List.<Transaction>}  transactions
 * @property  {boolean}             isVisible
 * @property  {string}              supplyingStoreId
 */
export class Name extends Realm.Object {
  /**
   * Delete any name to store joins referencing removed name.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // Clean up name store joins referencing deleted name.
    const nameStoreJoins = database.objects('NameStoreJoin').filtered('nameId == $0', this.id);
    database.delete('NameStoreJoin', nameStoreJoins);
  }

  /**
   * The customer credits for this name are the literal customer credit type transactions, as well
   * as any customer invoices which are cancellations. These cancelled customer invoices are
   * inverted customer invoices, which are equivallent to a customer credit.
   */
  get customerCredits() {
    const queryString = 'type == $0 || (type == $1 && isCancellation == $2)';
    return this.transactions.filtered(queryString, 'customer_credit', 'customer_invoice', true);
  }

  /**
   * Returns all customer invoices for this Name
   */
  get customerInvoices() {
    return this.transactions.filtered('type == $0', 'customer_invoice');
  }

  /**
   * Returns the available credit for this Name.
   */
  get availableCredit() {
    const sumOfCredits = this.customerCredits.sum('outstanding');
    const sumOfDebits = this.customerInvoices.sum('outstanding');

    return Math.abs(sumOfCredits + sumOfDebits);
  }

  /**
   * Get if name represents an external supplier.
   *
   * @return  {boolean}
   */
  get isExternalSupplier() {
    return this.type === 'facility' && this.isSupplier;
  }

  /**
   * Get if name represents an internal supplier.
   *
   * @return  {boolean}
   */
  get isInternalSupplier() {
    return this.type === 'store' && this.isSupplier;
  }

  /**
   * Add master list to name, if it has not already been added.
   *
   * @param  {MasterList}  masterList
   */
  addMasterListIfUnique(masterList) {
    if (this.masterLists.filtered('id == $0', masterList.id).length > 0) return;
    this.masterLists.push(masterList);
  }

  /**
   * Get string representation of name.
   */
  toString() {
    return this.name;
  }
}

Name.schema = {
  name: 'Name',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    code: { type: 'string', default: 'placeholderCode' },
    dateOfBirth: { type: 'date', optional: true },
    phoneNumber: { type: 'string', optional: true },
    billingAddress: { type: 'Address', optional: true },
    emailAddress: { type: 'string', optional: true },
    type: { type: 'string', default: 'placeholderType' },
    masterLists: { type: 'list', objectType: 'MasterList' },
    transactions: { type: 'linkingObjects', objectType: 'Transaction', property: 'otherParty' },
    isVisible: { type: 'bool', default: false },
    supplyingStoreId: { type: 'string', optional: true },
    firstName: { type: 'string', optional: true },
    lastName: { type: 'string', optional: true },
    isActive: { type: 'bool', optional: true },
    isCustomer: { type: 'bool', default: false },
    isSupplier: { type: 'bool', default: false },
    isManufacturer: { type: 'bool', default: false },
    isPatient: { type: 'bool', default: false },
    policies: { type: 'linkingObjects', objectType: 'InsurancePolicy', property: 'patient' },
    female: { type: 'bool', default: false },
    thisStoresPatient: { type: 'bool', default: false },
  },
};

export default Name;
