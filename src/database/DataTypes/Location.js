import Realm from 'realm';
import { getTotal } from '../utilities';

export class Location extends Realm.Object {
  get latestTemperature() {
    if (!this.sensor) return null;
    return this.sensor.latestValue;
  }

  get latestTemperatureTimestamp() {
    if (!this.sensor) return null;
    return this.sensor.latestValueTimestamp;
  }

  get latestBatteryLevel() {
    if (!this.sensor) return null;
    return this.sensor.latestBatteryLevel;
  }

  getAllBatches = database =>
    database.objects('ItemBatch').filtered('location.id == $0 and numberOfPacks != 0', this.id);

  stockCount = database => getTotal(this.getAllBatches(database), 'totalQuantity');

  possibleDamagedStock = database => {
    if (!this.sensor || this.sensor.sensorLogs.length === 0) return 0;

    const { sensorLogs } = this.sensor;

    return this.getAllBatches(database).reduce((sum, vaccineBatch) => {
      if (!vaccineBatch.item.locationType) return sum;
      const { minTemperature, maxTemperature } = vaccineBatch.item.locationType;

      const breaches = sensorLogs
        .filtered('timestamp > $0', vaccineBatch.addedDate)
        .filtered('value < $0 or value > $1', minTemperature, maxTemperature);

      return sum + (breaches.length > 0) * vaccineBatch.totalQuantity;
    }, 0);
  };

  toString() {
    return `${this.name} - ${this.sensor}`;
  }
}

Location.schema = {
  name: 'Location',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: '' },
    sensor: { type: 'Sensor', default: null },
  },
};
