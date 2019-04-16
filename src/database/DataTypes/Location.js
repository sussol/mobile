/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

// TODO remove data object
const data = {
  'Main Fridge': {
    isInBreach: false,
    totalStock: 64,
    currentTemperature: '3.5',
    temperatureExposure: { minTemperature: 2.5, maxTemperature: 7.5 },
    temperaturePoints: {
      maxLine: [
        { date: 'Feb 23', temp: 5 },
        { date: 'Feb 24', temp: 6 },
        { date: 'Feb 25', temp: 6 },
        { date: 'Feb 26', temp: 4 },
        { date: 'Feb 27', temp: 5 },
        { date: 'March 1', temp: 6 },
        { date: 'March 2', temp: 7 },
        { date: 'March 3', temp: 7.5 },
        { date: 'March 4', temp: 6.9 },
        { date: 'March 5', temp: 5 },
      ],
      minLine: [
        { date: 'Feb 23', temp: 3 },
        { date: 'Feb 24', temp: 2.5 },
        { date: 'Feb 25', temp: 3.8 },
        { date: 'Feb 26', temp: 3 },
        { date: 'Feb 27', temp: 3 },
        { date: 'March 1', temp: 3.5 },
        { date: 'March 2', temp: 3 },
        { date: 'March 3', temp: 5 },
        { date: 'March 4', temp: 4 },
        { date: 'March 5', temp: 2.5 },
      ],
      hazards: [],
      minTemp: 2,
      maxTemp: 8,
    },
  },
  'Secondary Fridge': {
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
  },
  'Backup Fridge': {
    isInBreach: true,
    totalStock: 0,
    currentTemperature: '1',
    temperatureExposure: { minTemperature: 1, maxTemperature: 5.2 },
    temperaturePoints: {
      maxLine: [
        { date: 'Feb 23', temp: 3 },
        { date: 'Feb 24', temp: 4 },
        { date: 'Feb 25', temp: 3.8 },
        { date: 'Feb 26', temp: 3.5 },
        { date: 'Feb 27', temp: 3.9 },
        { date: 'March 1', temp: 5 },
        { date: 'March 2', temp: 5.2 },
        { date: 'March 3', temp: 4.8 },
        { date: 'March 4', temp: 3 },
        { date: 'March 5', temp: 2 },
      ],
      minLine: [
        { date: 'Feb 23', temp: 2 },
        { date: 'Feb 24', temp: 2.2 },
        { date: 'Feb 25', temp: 2.1 },
        { date: 'Feb 26', temp: 1.5 },
        { date: 'Feb 27', temp: 3 },
        { date: 'March 1', temp: 2.5 },
        { date: 'March 2', temp: 2.1 },
        { date: 'March 3', temp: 1.5 },
        { date: 'March 4', temp: 1.2 },
        { date: 'March 5', temp: 1 },
      ],
      hazards: [{ date: 'March 5', temp: 1, onClick: () => console.log('CLICKED HAZARD 4') }],
      minTemp: 2,
      maxTemp: 8,
    },
  },
};
export class Location extends Realm.Object {
  get isFridge() {
    if (!this.locationType) return null;
    if (!this.locationType.description) return null;
    return String(this.locationType.description).toLowerCase() === 'fridge';
  }

  getTemperaturePoints() {
    return data[this.description].temperaturePoints;
  }

  getNumberOfBreaches() {
    return data[this.description].temperaturePoints.hazards.length;
  }

  getCurrentTemperature() {
    return data[this.description].currentTemperature;
  }

  getTemperatureExposure() {
    return data[this.description].temperatureExposure;
  }

  getTotalStock() {
    return data[this.description].totalStock;
  }

  get isInBreach() {
    return data[this.description].isInBreach;
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
