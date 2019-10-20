/* eslint-disable no-underscore-dangle */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class LocationType extends Realm.Object {
  /**
   * Returns the parsed JSON custom data object.
   */
  get customData() {
    if (!this._customData) return {};
    return JSON.parse(this._customData);
  }

  /**
   * Sets the underlying _customData field as a string
   * from a basic JS object.
   */
  set customData(customData) {
    this._customData = JSON.stringify(customData);
  }
}

LocationType.schema = {
  name: 'LocationType',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', optional: true },
    minTemperature: { type: 'double', default: 2 },
    maxTemperature: { type: 'double', default: 8 },
    _customData: { type: 'string', optional: true },
  },
};

export default LocationType;
