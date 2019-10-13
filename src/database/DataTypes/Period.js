/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A period is a simple start and end date. Grouped by periodSchedules
 * which are related to a MasterList and store. Used for applying
 * settings from for a certain orderType.
 *
 * EG: A program - "HIV", a store "CHR" and the order type "Normal"
 * may have a maxOrdersPerPeriod of 1.
 * @property  {string} id
 * @property  {string} name           A generic name field
 * @property  {string} startDate      The starting date for the period
 * @property  {string} endDate        The end date for this period
 * @property  {string} periodSchedule The related schedule
 * @property  {string} requisitions   related requisitions
 */
export class Period extends Realm.Object {
  numberOfRequisitions() {
    return this.requisitions.length;
  }

  requisitionsForOrderType(program, orderType) {
    return this.requisitions.filtered(
      'program.id = $0 && orderType = $1',
      program.id,
      orderType.name
    ).length;
  }

  addRequisitionIfUnique(requisition) {
    if (this.requisitions.filtered('id == $0', requisition.id).length > 0) return;
    this.requisitions.push(requisition);
  }

  toInfoString() {
    return `${this.name} (${this})`;
  }

  toString() {
    return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
  }
}

export default Period;

Period.schema = {
  name: 'Period',
  primaryKey: 'id',
  properties: {
    id: 'string',
    startDate: { type: 'date', default: new Date() },
    endDate: { type: 'date', default: new Date() },
    name: { type: 'string', default: 'Placeholder Name' },
    periodSchedule: 'PeriodSchedule',
    requisitions: { type: 'list', objectType: 'Requisition' },
  },
};
