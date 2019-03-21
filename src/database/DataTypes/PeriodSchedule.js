/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class PeriodSchedule extends Realm.Object {
  getUseablePeriods(maxMOS) {
    const periods = this.periods.reduce(period => {
      if (period.numberOfRequisitions() >= maxMOS) return null;
      return period;
    });
    return periods;
  }

  addPeriod(period) {
    this.periods.push(period);
  }

  addPeriodIfUnique(period) {
    if (this.periods.filtered('id == $0', period.id).length > 0) return;
    this.addPeriod(period);
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
