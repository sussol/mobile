/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { NativeModules } from 'react-native';
import { generateUUID } from 'react-native-database';

// Manufacturer for a BlueMaestro Sensor device
const MANUFACTURER_ID = 307;

// Commands supported. All are for a BlueMaestro Sensor device. If newer
// devices are supported this will need to be expanded.
const COMMANDS = {
  BLINK: '*blink',
  RESET_ADV_FREQ: '*sadv1000',
  RESET_LOG_FREQ: '*lint240',
  DL_LOGS: '*logall',
};

export class Sensor extends Realm.Object {
  /**
   * Returns a string representation of a Sensor log object.
   */
  get toString() {
    return `Mac address: ${this.macAddress} Current temperature: ${this.temperature}`;
  }

  /**
   * Returns all SensorLog records of this Sensor which have been aggregated.
   */
  get aggregatedLogs() {
    return this.sensorLogs.filtered('aggregation != null && aggregation != ""');
  }

  /**
   * Returns the most recent aggregated SensorLog from this Sensor.
   */
  get latestAggregatedLog() {
    if (this.aggregatedLogs.length === 0) return null;

    const latestTimestamp = this.aggregatedLogs.max('timestamp');

    if (!latestTimestamp) return null;

    return this.aggregatedLogs.filtered('timestamp == $0', latestTimestamp)[0];
  }

  /**
   * Returns the latest log of this sensor
   */
  get latestLog() {
    const sortedLogs = this.sensorLogs.sorted('timestamp');
    return sortedLogs.length !== 0 ? sortedLogs[0] : null;
  }

  /**
   * Returns the most recent temperature logged from this Sensor
   */
  get latestTemperature() {
    if (!this.latestLog) return null;

    const { temperature } = this.latestLog;

    return temperature;
  }

  /**
   * Returns if this Sensor is currently in a breach
   */
  get isInBreach() {
    if (!this.latestAggregatedLog) return false;

    const { isInBreach } = this.latestAggregatedLog;

    return isInBreach;
  }

  /**
   * Scans for all devices matching the passed manufacturer ID,
   * returning their advertisement data. Updates or creates
   * any found sensors.
   */
  static async scanForSensors(database) {
    try {
      const { BleManager } = NativeModules;

      const result = await BleManager.getDevices(MANUFACTURER_ID, '');

      const { success } = result;
      if (!success) return result;

      const { data } = result;
      // Try to either  update or create a sensorFor each sensor
      // whose advertisement data was fetched.
      database.write(() => {
        data.forEach(sensor => {
          const { macAddress } = sensor;
          const sensorToUpdate = database.get('Sensor', 'macAddress', macAddress);
          const { id = generateUUID() } = sensorToUpdate || {};
          database.update('Sensor', { ...sensor, id });
        });
      });

      return { success: true, data: { sensorsUpdated: data.length } };
    } catch (error) {
      return { success: false, error };
    }
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
    try {
      const { BleManager } = NativeModules;
      return await BleManager.sendCommand(MANUFACTURER_ID, this.macAddress, command);
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
      return await this.sendCommand(COMMANDS.BLINK);
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
      const firstResult = await this.sendCommand(COMMANDS.RESET_LOG_FREQ);
      const { success: firstSuccess } = firstResult;
      if (!firstSuccess) return firstResult;

      const secondResult = await this.sendCommand(COMMANDS.RESET_ADV_FREQ);

      return secondResult;
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
      return await this.sendCommand(COMMANDS.DL_LOGS);
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

      if (!success || !data || data.length === 0) return result;

      const advertisement = data[0];

      const { macAddress, batteryLevel, temperature, logInterval } = advertisement;

      if (macAddress !== this.macAddress) {
        return { success: false, error: { message: 'MAC address mismatch' } };
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
