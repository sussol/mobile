/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { NativeModules } from 'react-native';

export class Sensor extends Realm.Object {
  get toString() {
    return `MAC: ${this.macAddress} TEMP: ${this.temperature}`;
  }

  get latestAggregatedLog() {
    const aggregatedLogs = this.sensorLogs.filtered('aggregation != null && aggregation != ""');
    if (aggregatedLogs.length === 0) return null;
    const latestTimestamp = aggregatedLogs.max('timestamp');
    if (!latestTimestamp) return null;
    return aggregatedLogs.filtered('timestamp == $0', latestTimestamp)[0];
  }

  get latestTemperature() {
    const { latestAggregatedLog } = this;
    if (latestAggregatedLog === null) return null;
    return latestAggregatedLog.temperature;
  }

  get latestTimestamp() {
    const { latestAggregatedLog } = this;
    if (latestAggregatedLog === null) return null;
    return latestAggregatedLog.timestamp;
  }

  get isInBreach() {
    const { latestAggregatedLog } = this;
    if (latestAggregatedLog === null) return false;
    return latestAggregatedLog.isInBreach;
  }

  async sendCommand({ manufacturerId, command }) {
    const { BleManager } = NativeModules;
    try {
      return await BleManager.sendCommand(manufacturerId, this.macAddress, command);
    } catch (error) {
      return error;
    }
  }

  async sendBlink(manufacturerId) {
    try {
      const { success } = await this.sendCommand({ manufacturerId, command: '*blink' });
      return success;
    } catch (error) {
      return error;
    }
  }

  async sendReset({ manufacturerId }) {
    try {
      const firstResult = await this.sendCommand({ manufacturerId, command: '*lint240' });
      const { success: firstSuccess } = firstResult;
      if (!firstSuccess) return false;

      const secondResult = await this.sendCommand({ manufacturerId, command: '*sadv1000' });
      const { success: secondSuccess } = secondResult;
      if (!secondSuccess) return false;

      return true;
    } catch (error) {
      return error;
    }
  }

  async downloadLogs({ manufacturerId }) {
    try {
      return await this.sendCommand({ manufacturerId, command: '*logall' });
    } catch (error) {
      return error;
    }
  }

  async scanAndUpdate({ manufacturerId, database }) {
    const { BleManager } = NativeModules;
    try {
      const result = await BleManager.getDevices(manufacturerId, this.macAddress);
      const { success, data } = result;
      console.log(result);
      if (!success) return false;
      if (!data || data.length === 0) return false;
      const advertisement = data[0];
      const { macAddress, batteryLevel, currentTemperature, loggingInterval } = advertisement;
      console.log('scan and update');
      console.log(macAddress, batteryLevel, currentTemperature, loggingInterval);
      if (macAddress !== this.macAddress) return false;
      database.write(() => {
        database.update('Sensor', {
          id: this.id,
          batteryLevel,
          temperature: currentTemperature,
          logInterval: loggingInterval,
          lastConnectionTimestamp: new Date(),
        });
      });
      return true;
    } catch (error) {
      return error;
    }
  }
}

Sensor.schema = {
  name: 'Sensor',
  primaryKey: 'id',
  properties: {
    id: 'string',
    location: { type: 'Location', optional: true },
    name: { type: 'string', optional: true },
    macAddress: { type: 'string', optional: true },
    batteryLevel: { type: 'double', optional: true },
    logInterval: { type: 'int', optional: true },
    numberOfLogs: { type: 'int', optional: true },
    temperature: { type: 'double', optional: true },
    lastConnectionTimestamp: { type: 'date', optional: true },
    sensorLogs: { type: 'list', objectType: 'SensorLog' },
  },
};

export default Sensor;
