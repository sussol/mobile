/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class VaccineVialMonitorStatus extends Realm.Object {}

VaccineVialMonitorStatus.schema = {
  name: 'VaccineVialMonitorStatus',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', optional: true },
    code: { type: 'string', optional: true },
    level: { type: 'double', default: 0 },
    isActive: { type: 'string', default: false },
  },
};

export default VaccineVialMonitorStatus;
