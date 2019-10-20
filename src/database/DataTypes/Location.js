/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { getTotal } from '../utilities';

export class Location extends Realm.Object {
  /**
   * Returns all aggregated SensorLogs for this Location.
   *
   * @param {Realm}  database             App-wide database interface
   * @param {Number} lookBackMilliseconds Number of milliseconds to lookback
   */
  getSensorLogs(database, lookBackMilliseconds = null) {
    const sensorLogs = database
      .objects('AggregatedSensorLog')
      .filtered('location.id = $0', this.id);

    if (!lookBackMilliseconds) return sensorLogs;

    const fromDate = new Date(new Date() - lookBackMilliseconds);
    return sensorLogs.filtered('timestamp >= $0', fromDate);
  }

  //   getNumberOfBreaches(...params) {
  //     return extractBreaches(this.getSensorLogs(...params)).length;
  //   }

  /**
   * Returns the Sensor related to this location.
   *
   * @param {Realm} database App-wide database interface
   */
  getSensor(database) {
    const sensor = database.get('Sensor', 'location.id', this.id);

    if (!sensor) return null;

    return sensor;
  }

  /**
   * Returns the current temperature in the location.
   *
   * @param {Realm} database App-wide database interface
   */
  getCurrentTemperature(database) {
    const sensor = this.getSensor(database);

    if (!sensor) return null;

    const { latestTemperature } = sensor;
    return latestTemperature;
  }

  /**
   * Returns the minimum and maximum temperatures of this
   * Location
   *
   * @param  {Realm} database App-wide database interface
   * @return {Object} { minTemperature, maxTemperature }
   */
  getTemperatureExposure(database) {
    const sensorLogs = this.getSensorLogs(database);
    return {
      minTemperature: sensorLogs.min('temperature'),
      maxTemperature: sensorLogs.max('temperature'),
    };
  }

  /**
   * Returns the ItemBatches related to this Location which have stock.
   *
   * @param {Realm} database App-wide database interface
   */
  getItemBatchesWithQuantity(database) {
    return database.objects('ItemBatch').filtered('location.id = $0 && numberOfPacks > 0', this.id);
  }

  /**
   * Gets the TotalStock of batches in this Location
   *
   * @param {Realm} database App-wide database interface
   */
  getTotalStock(database) {
    return getTotal(this.getItemBatchesWithQuantity(database), 'totalQuantity');
  }

  /**
   * Returns if this Location is currently in breach.
   *
   * @param {Realm} database App-wide database interface
   */
  isInBreach(database) {
    const sensor = this.getSensor(database);

    if (!sensor) return false;

    const { isInBreach } = sensor;
    return isInBreach;
  }

  /**
   * Returns the temperature range of this Location
   */
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
