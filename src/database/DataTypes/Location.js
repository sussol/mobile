/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Location extends Realm.Object {
  // TODO remove data object
  data = {
    isInBreach: false,
    totalStock: 16,
    currentTemperature: '5.2',
    temperatureExposure: { minTemperature: 2.5, maxTemperature: 10 },
    temperaturePoints: {
      maxLine: [
        { date: 'Feb 23', temp: 5 },
        { date: 'Feb 24', temp: 8 },
        { date: 'Feb 25', temp: 8.5 },
        { date: 'Feb 26', temp: 9 },
        { date: 'Feb 27', temp: 10 },
        { date: 'March 1', temp: 7 },
        { date: 'March 2', temp: 5 },
        { date: 'March 3', temp: 4 },
        { date: 'March 4', temp: 5 },
        { date: 'March 5', temp: 6 },
      ],
      minLine: [
        { date: 'Feb 23', temp: 2.5 },
        { date: 'Feb 24', temp: 5 },
        { date: 'Feb 25', temp: 5.7 },
        { date: 'Feb 26', temp: 7.5 },
        { date: 'Feb 27', temp: 8 },
        { date: 'March 1', temp: 6 },
        { date: 'March 2', temp: 3.4 },
        { date: 'March 3', temp: 3 },
        { date: 'March 4', temp: 2.5 },
        { date: 'March 5', temp: 4 },
      ],
      hazards: [{ date: 'Feb 27', temp: 10, onClick: () => console.log('CLICKED HAZARD 4') }],
      minTemp: 2,
      maxTemp: 8,
    },
  };

  get isFridge() {
    if (!this.locationType) return null;
    if (!this.locationType.description) return null;
    return String(this.locationType.description).toLowerCase() === 'fridge';
  }

  getTemperaturePoints() {
    return this.data.temperaturePoints;
  }

  getNumberOfBreaches() {
    return this.data.temperaturePoints.hazards.length;
  }

  getCurrentTemperature() {
    return this.data.currentTemperature;
  }

  getTemperatureExposure() {
    return this.data.temperatureExposure;
  }

  getTotalStock() {
    return this.data.totalStock;
  }

  get isInBreach() {
    return this.data.isInBreach;
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
