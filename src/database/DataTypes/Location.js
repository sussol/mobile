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

  batchesAtTime(database, timestamp) {
    const locationMovements = this.locationMovements.filtered(
      'enterTimestamp <= $0 && (exitTimestamp > $0 || exitTimestamp == null)',
      timestamp ?? new Date()
    );
    const queryString = locationMovements.map(({ id }) => `id == "${id}"`).join(' OR ');
    const itemBatches = database.objects('ItemBatch');

    return queryString ? itemBatches.filtered(queryString) : itemBatches;
  }

  totalStock(database) {
    const batches = this.batchesAtTime(database);
    return batches.sum('numberOfPacks') ?? 0;
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
    locationMovements: {
      type: 'linkingObjects',
      objectType: 'LocationMovement',
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
  },
};

export default Location;
