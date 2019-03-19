/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Period extends Realm.Object {}

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
  },
};
