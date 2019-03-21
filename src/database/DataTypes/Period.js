/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Period extends Realm.Object {
  numberOfRequisitions() {
    return this.requisitions.length;
  }

  numberOfRequisitionsForProgram(program) {
    return this.requisitions.filtered('program.id = $0', program.id).length;
  }

  addRequisition(requisition) {
    this.requisitions.push(requisition);
  }

  addRequisitionIfUnique(requisition) {
    if (this.requisitions.filtered('id == $0', requisition.id).length > 0) return;
    this.addBatch(requisition);
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
