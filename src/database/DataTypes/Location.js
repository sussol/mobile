/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Location extends Realm.Object {
  // TODO
  // getBreaches(database) <- ('SensorLogs') filter this ID and isInBreach = true
  // getBatches ?

  get isFridge() {
    if (!this.locationType) return null;
    if (!this.locationType.description) return null;
    return String(this.locationType.description).toLowerCase() === 'fridge';
  }
}

Location.schema = {
  name: 'Location',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', optional: true },
    code: { type: 'string', optional: true },
    locationType: { type: 'LocationType', optional: true },
  },
};

export default Location;
