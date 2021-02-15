/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class Location extends Realm.Object {
  get mostRecentTemperatureLog() {
    return this.temperatureLogs.sorted('timestamp', true)[0];
  }

  get mostRecentTemperatureBreach() {
    return this.breaches.sorted('startTimestamp', true)[0];
  }

  get leastRecentTemperatureLog() {
    return this.temperatureLogs.sorted('timestamp', false)[0];
  }

  /**
   * This location is currently experiencing a temperature breach
   * if the most recent breach for the location has no end timestamp.
   */
  get hasBreached() {
    const mostRecentBreach = this.mostRecentTemperatureBreach;
    return mostRecentBreach && !mostRecentBreach.endTimestamp;
  }

  get currentTemperature() {
    const { temperature } = this.mostRecentTemperatureLog ?? {};
    return temperature;
  }

  get numberOfBreaches() {
    return this.breaches.length;
  }

  get temperatureExposure() {
    const minimumTemperature = this.temperatureLogs.min('temperature') ?? Infinity;
    const maximumTemperature = this.temperatureLogs.max('temperature') ?? -Infinity;

    return { minimumTemperature, maximumTemperature };
  }

  batchesDuringTime(database, startTimestamp, endTimestamp) {
    const locationMovements = this.locationMovements.filtered(
      '(enterTimestamp <= $0 && (exitTimestamp > $0 || exitTimestamp == null)) ||' +
        '(enterTimestamp >= $0 && enterTimestamp <= $1)',
      startTimestamp ?? new Date(),
      endTimestamp ?? new Date()
    );

    return locationMovements.map(({ itemBatch }) => itemBatch);
  }

  totalStock() {
    return this.batches.sum('numberOfPacks') ?? 0;
  }

  get hotCumulativeBreachConfig() {
    return this.breachConfigs.filtered("type == 'HOT_CUMULATIVE'")[0];
  }

  get coldCumulativeBreachConfig() {
    return this.breachConfigs.filtered("type == 'COLD_CUMULATIVE'")[0];
  }

  get hotConsecutiveBreachConfig() {
    return this.breachConfigs.filtered("type == 'HOT_CONSECUTIVE'")[0];
  }

  get coldConsecutiveBreachConfig() {
    return this.breachConfigs.filtered("type == 'COLD_CONSECUTIVE'")[0];
  }

  get currentBreach() {
    return this.breaches.filtered('endTimestamp == null')[0];
  }

  get isInHotBreach() {
    return !!this.currentBreach?.type === 'HOT_CONSECUTIVE';
  }

  get isInColdBreach() {
    return !!this.currentBreach?.type === 'COLD_CONSECUTIVE';
  }

  // Sensor to location should be a one to one relationship at all times. Pick the first and
  // make the assumption it is the correct one.
  get sensor() {
    return this.sensors[0];
  }

  get batteryLevel() {
    return this.sensor?.batteryLevel ?? 0;
  }
}

Location.schema = {
  name: 'Location',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', default: '' },
    code: { type: 'string', default: '' },
    locationType: { type: 'LocationType', optional: true },
    locationMovements: {
      type: 'linkingObjects',
      objectType: 'LocationMovement',
      property: 'location',
      default: [],
    },
    sensors: {
      type: 'linkingObjects',
      objectType: 'Sensor',
      property: 'location',
    },
    temperatureLogs: {
      type: 'linkingObjects',
      objectType: 'TemperatureLog',
      property: 'location',
    },
    breaches: {
      type: 'linkingObjects',
      objectType: 'TemperatureBreach',
      property: 'location',
    },
    batches: {
      type: 'linkingObjects',
      objectType: 'ItemBatch',
      property: 'location',
    },
    breachConfigs: {
      type: 'linkingObjects',
      objectType: 'TemperatureBreachConfiguration',
      property: 'location',
    },
  },
};

export default Location;
