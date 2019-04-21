/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { extractBreaches } from '../../utilities/modules/vaccines';
import { getTotal } from '../utilities';

export class Location extends Realm.Object {
  get isFridge() {
    const { locationType: { description } = { description: '' } } = this;
    return description.toLowerCase() === 'fridge';
  }

  getSensorLogs(database, lookBackMilliseconds = null) {
    const sensorLogs = database.objects('SensorLogs').filtered('location.id = $0', this.id);
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
