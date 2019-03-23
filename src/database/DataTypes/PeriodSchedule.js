/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class PeriodSchedule extends Realm.Object {
  getUseablePeriodsForProgram(program, maxOrdersPerPeriod) {
    const periods = this.periods.filter(
      period => period.numberOfRequisitionsForProgram(program) < maxOrdersPerPeriod
    );
    return periods;
  }

  addPeriodIfUnique(period) {
    if (this.periods.filtered('id == $0', period.id).length > 0) return;
    this.periods.push(period);
  }
}

export default PeriodSchedule;

PeriodSchedule.schema = {
  name: 'PeriodSchedule',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Placeholder Name' },
    periods: { type: 'list', objectType: 'Period' },
  },
};
