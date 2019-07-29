/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { NativeModules } from 'react-native';
import { generateUUID } from 'react-native-database';

const MANUFACTURER_ID = 307;

const getCommand = (manufacturerID, command, param) => {
  const commands = {
    307: {
      BLINK: '*blink',
      RESET_ADV_FREQ: '*sadv1000',
      RESET_LOG_FREQ: `*lint${param}`,
      DL_LOGS: '*logall',
    },
  };
  return commands[manufacturerID][command];
};

export class Sensor extends Realm.Object {
  /**
   * Scans for all devices matching the passed manufacturer ID,
   * returning their advertisement data. Updates or creates
   * any found sensors.
   */
  static async scanForSensors(database) {
    try {
      const { BleManager } = NativeModules;
      const result = await BleManager.getDevices(MANUFACTURER_ID, '');
      if (!result.success) return result;
      const { data } = result;
      database.write(() => {
        data.forEach(sensor => {
          const { temperature, batteryLevel, logInterval, macAddress, numberOfLogs } = sensor;
          const sensorToUpdate = database.objects('Sensor').filtered('macAddress = $0', macAddress);
          database.update('Sensor', {
            id: sensorToUpdate.length ? sensorToUpdate[0].id : generateUUID(),
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

  /**
   * Send a command to the physical device this model
   * represents, returning the result.
   * Return object shapes:
   * {
   *  success: true/false,
   *  data,
   *  error [when success = false]
   * }
   */
  async sendCommand(command) {
    const { BleManager } = NativeModules;
    try {
      const manufacturerId = MANUFACTURER_ID;
      return await BleManager.sendCommand(manufacturerId, this.macAddress, command);
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Sends a blink command, request the LED on the physical
   * sensor light up.
   * Return object:
   * { success: true/false }
   */
  async sendBlink() {
    try {
      const command = getCommand(MANUFACTURER_ID, 'BLINK');
      return await this.sendCommand(command);
    } catch (error) {
      return error;
    }
  }

  /**
   * Sends reset commands to a physical sensor, resetting the
   * logging interval, causing all currently stored logs to be
   * deleted and resetting the sensor advertisement frequency.
   * Return object:
   * { success: true/false }
   */
  async sendReset() {
    try {
      const firstCommand = getCommand(MANUFACTURER_ID, 'RESET_LOG_FREQ');
      const firstResult = await this.sendCommand(firstCommand);
      const { success: firstSuccess } = firstResult;
      if (!firstSuccess) return false;

      const secondCommand = getCommand(MANUFACTURER_ID, 'RESET_ADV_FREQ');
      const secondResult = await this.sendCommand(secondCommand);
      const { success: secondSuccess } = secondResult;
      if (!secondSuccess) return false;

      return true;
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Downloads all stored logs from this sensor. Returns an object in the shape
   * {
   *   success: true,
   *   data: [{ logs: [] }]
   * }
   * or on not being able to download:
   * {
   *  success: false,
   *  error,
   * }
   */
  async downloadLogs() {
    try {
      const command = getCommand(MANUFACTURER_ID, 'DL_LOGS');
      return await this.sendCommand(command);
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Connects with the native bluetooth adapter to scan for this sensor
   * and retrieve the advertisement data, updating this sensor.
   * Return object: See BleParser.java
   */
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
