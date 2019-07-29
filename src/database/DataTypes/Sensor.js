/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { NativeModules } from 'react-native';
import { generateUUID } from 'react-native-database';

const MANUFACTURER_ID = 307;

export class Sensor extends Realm.Object {
  static async scanForSensors(database) {
    try {
      const { BleManager } = NativeModules;
      const result = await BleManager.getDevices(MANUFACTURER_ID, '');
      if (!result.success) return result;
      const { data } = result;
      database.write(() => {
        data.forEach(sensor => {
          const { temperature, batteryLevel, logInterval, macAddress, numberOfLogs } = sensor;
          database.update('Sensor', {
            id: generateUUID(),
            temperature,
            batteryLevel,
            logInterval,
            macAddress,
            numberOfLogs,
          });
        });
      });
      return { success: true, data: { sensorsUpdated: data.length } };
    } catch (error) {
      return { success: false, error };
    }
  }

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

  async sendCommand(command) {
    const { BleManager } = NativeModules;
    try {
      const manufacturerId = MANUFACTURER_ID;
      return await BleManager.sendCommand(manufacturerId, this.macAddress, command);
    } catch (error) {
      return error;
    }
  }

  async sendBlink() {
    try {
      return await this.sendCommand('*blink');
    } catch (error) {
      return error;
    }
  }

  async sendReset() {
    try {
      const firstResult = await this.sendCommand('*lint240');
      const { success: firstSuccess } = firstResult;
      if (!firstSuccess) return false;

      const secondResult = await this.sendCommand('*sadv1000');
      const { success: secondSuccess } = secondResult;
      if (!secondSuccess) return false;

      return true;
    } catch (error) {
      return error;
    }
  }

  async downloadLogs() {
    try {
      const command = '*logall';
      return await this.sendCommand(command);
    } catch (error) {
      return { success: false, error };
    }
  }

  async scanAndUpdate({ manufacturerId, database }) {
    const { BleManager } = NativeModules;
    try {
      const result = await BleManager.getDevices(manufacturerId, this.macAddress);
      const { success, data } = result;
      if (!success) return result;
      if (!data || data.length === 0) return result;

      const advertisement = data[0];
      const { macAddress, batteryLevel, temperature, logInterval } = advertisement;
      if (macAddress !== this.macAddress) {
        return { success: false, error: { message: 'MAC Address mismatch' } };
      }

      database.write(() => {
        database.update('Sensor', {
          id: this.id,
          batteryLevel,
          temperature,
          logInterval,
          lastConnectionTimestamp: new Date(),
        });
      });
      return result;
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
