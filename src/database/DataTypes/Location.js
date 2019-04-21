/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { extractBreaches } from '../../utilities/modules/vaccines';
import { getTotal } from '../utilities';

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
    const { locationType: { description } = { description: '' } } = this;
    return description.toLowerCase() === 'fridge';
  }

  getTemperaturePoints() {
    return this.data.temperaturePoints;
  }

  getSensorLogs(database, lookBackMilliseconds = null) {
    const sensorLogs = database.objects('SensorLog').filtered('location.id = $0', this.id);
    if (!lookBackMilliseconds) return sensorLogs;
    const fromDate = new Date(new Date() - lookBackMilliseconds);
    return sensorLogs.filtered('timestamp >= $0', fromDate);
  }

  getNumberOfBreaches(...params) {
    return extractBreaches(this.getSensorLogs(...params)).length;
  }

  getSensor(database) {
    const sensor = database.object('Sensor').filtered('location.id = $0', this.id);
    if (sensor.length === 0) return null;
    return sensor[0];
  }

  getCurrentTemperature(database) {
    const sensor = this.getSensor(database);
    if (!sensor) return null;
    return sensor.temperature;
  }

  getTemperatureExposure(database) {
    const sensorLogs = this.getSensorLogs(database);
    return {
      minTemperature: sensorLogs.min('temperature'),
      maxTemperature: sensorLogs.max('temperature'),
    };
  }

  getItemBatchesWithQuantity(database) {
    return database.objects('ItemBatch').filtered('location.id = $0 && numberOfPacks > 0', this.id);
  }

  getTotalStock(database) {
    return getTotal(this.getItemBatchesWithQuantity(database), 'totalQuantity');
  }

  isCriticalTemperature(database) {
    const currentTemperature = this.getCurrentTemperature(database);
    const { minTemperature, maxTemperature } = this.temperatureRange;
    return minTemperature >= currentTemperature || currentTemperature >= maxTemperature;
  }

  get temperatureRange() {
    if (!this.isFridge) return null;
    const { minTemperature, maxTemperature } = this.locationType;
    return { minTemperature, maxTemperature };
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
