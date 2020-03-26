/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class VaccineVialMonitorStatusLog extends Realm.Object {}

VaccineVialMonitorStatusLog.schema = {
  name: 'Location',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: 'VaccineVialMonitorStatus',
    date: { type: 'date', default: new Date() },
    itemBatch: 'ItemBatch',
  },
};

export default VaccineVialMonitorStatusLog;
