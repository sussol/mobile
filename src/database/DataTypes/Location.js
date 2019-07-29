/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { extractBreaches } from '../../utilities/modules/vaccines/chartHelpers';
import { getTotal } from '../utilities';

export class Location extends Realm.Object {
  getSensorLogs(database, lookBackMilliseconds = null) {
    const sensorLogs = database
      .objects('SensorLog')
      .filtered('location.id = $0 && aggregation != null && aggregation != ""', this.id);
    if (!lookBackMilliseconds) return sensorLogs;
    const fromDate = new Date(new Date() - lookBackMilliseconds);
    return sensorLogs.filtered('timestamp >= $0', fromDate);
  }

  getNumberOfBreaches(...params) {
    return extractBreaches(this.getSensorLogs(...params)).length;
  }

  getSensor(database) {
    const sensor = database.objects('Sensor').filtered('location.id = $0', this.id);
    if (sensor.length === 0) return null;
    return sensor[0];
  }

  getCurrentTemperature(database) {
    const sensor = this.getSensor(database);
    if (!sensor) return null;
    return sensor.latestTemperature;
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

  isInBreach(database) {
    const sensor = this.getSensor(database);
    if (!sensor) return false;
    return sensor.isInBreach;
  }

  get temperatureRange() {
    if (!this.locationType) return null;
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
