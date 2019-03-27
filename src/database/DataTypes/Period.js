/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Period extends Realm.Object {
  numberOfRequisitions() {
    return this.requisitions.length;
  }

  removeRequisition(requisition, database) {
    const indexToRemove = this.requisitions.indexOf(requisition);
    this.requisitions.splice(indexToRemove, 1);
    database.save('Period', this);
  }

  requisitionsForProgram(program) {
    return this.requisitions.filtered('program.id = $0', program.id).length;
  }

  addRequisitionIfUnique(requisition) {
    if (this.requisitions.filtered('id == $0', requisition.id).length > 0) return;
    this.requisitions.push(requisition);
  }

  getFormattedPeriod() {
    return `${this.startDate.toLocaleDateString('en-US')} - ${this.endDate.toLocaleDateString(
      'en-US'
    )} `;
  }

  toString() {
    return `${this.startDate.toLocaleDateString('en-US')} - ${this.endDate.toLocaleDateString(
      'en-US'
    )} `;
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
