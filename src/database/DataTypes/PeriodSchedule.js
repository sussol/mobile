/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class PeriodSchedule extends Realm.Object {}

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
