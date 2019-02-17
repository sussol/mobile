import Realm from 'realm';
import { getTotal } from '../utilities';

export class Location extends Realm.Object {
  get latestTemperature() {
    if (!this.sensor) return null;
    return this.sensor.latestValue;
  }

  getAggregatedTemps = ({ type, hourPeriod, lookBackDays }) => {
    const addHours = (hours, datetime) => {
      const newDatetime = new Date(datetime);
      newDatetime.setTime(newDatetime.getTime() + hours * 60 * 60 * 1000);
      return newDatetime;
    };

    const addDays = (days, datetime) => {
      const newDatetime = new Date(datetime);
      newDatetime.setTime(newDatetime.getTime() + days * 60 * 60 * 1000 * 24);
      return newDatetime;
    };

    const nowDate = new Date();
    const startDate = addDays(lookBackDays * -1, nowDate);

    const sensorLogs = this.sensor.sensorLogs
      .filtered('timestamp >= $0', startDate)
      .sorted('timestamp', false);

    console.log('number of logs', startDate, sensorLogs.length);
    let currentDate = startDate;

    const result = [];
    let i = 0;

    let nextDate = addHours(hourPeriod, currentDate);

    while (nextDate < nowDate) {
      let value = i >= sensorLogs.length ? null : sensorLogs[i].value;
      console.log( 'i >= sensorLogs.length', i >= sensorLogs.length);
      console.log( 'i < sensorLogs.length && sensorLogs[i].timestamp < nextDate',
       i < sensorLogs.length && sensorLogs[i].timestamp < nextDate, i, nextDate, i < sensorLogs.length && sensorLogs[i].timestamp);
      if (i < sensorLogs.length && sensorLogs[i].timestamp < nextDate) {
        for (; i < sensorLogs.length && nextDate >= sensorLogs[i].timestamp; i++) {
          if (type === 'min') {
            if (value > sensorLogs[i].value) value = sensorLogs[i].value;
          } else {
            if (value < sensorLogs[i].value) value = sensorLogs[i].value;
          }
        }
      } else value = null;

      result.push({
        x:
          currentDate.getDate() +
          '/' +
          (currentDate.getMonth() + 1) +
          ' ' +
          currentDate.getHours() +
          ':' +
          currentDate.getMinutes(),
        y: value,
      });
      currentDate = new Date(nextDate);
      nextDate = addHours(hourPeriod, nextDate);
    }
    console.log('resultOf max/min', type, result);
    return result;
  };

  get latestTemperatureTimestamp() {
    if (!this.sensor) return null;
    return this.sensor.latestValueTimestamp;
  }

  get latestBatteryLevel() {
    if (!this.sensor) return null;
    return this.sensor.latestBatteryLevel;
  }

  get maxTemp() {
    return 7.5;
  }

  get minTemp() {
    return 3;
  }

  get currentTemp() {
    return this.latestTemperature;
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
    soh: { type: 'string', default: '$200' },
    sensor: { type: 'Sensor', default: null },
  },
};
