/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';
import { NativeModules } from 'react-native';

const { BleManager } = NativeModules;

const BLUE_MAESTRO_ID = 307;

export class Sensor extends Realm.Object {
  static async startScan(macAddress = '') {
    return BleManager.getDevices(BLUE_MAESTRO_ID, macAddress);
  }

  async sendCommand(command) {
    return BleManager.sendCommand(BLUE_MAESTRO_ID, this.macAddress, command);
  }

  async blink() {
    return this.sendCommand('*blink');
  }

  async resetLogFrequency() {
    return this.sendCommand('*lint300');
  }

  async resetAdvertisementFrequency() {
    return this.sendCommand('*sadv1000');
  }

  async downloadLogs() {
    return this.sendCommand('*logall');
  }

  get isInBreach() {
    return this.location?.isInBreach ?? false;
  }

  get mostRecentTemperatureBreach() {
    return this.location?.mostRecentTemperatureBreach;
  }
}

Sensor.schema = {
  name: 'Sensor',
  primaryKey: 'id',
  properties: {
    id: 'string',
    macAddress: { type: 'string', optional: true },
    name: { type: 'string', optional: true },
    location: { type: 'Location', optional: true },
    batteryLevel: { type: 'double', default: 0 },
    sensorLogs: { type: 'linkingObjects', objectType: 'SensorLog', property: 'sensor' },
    location: { type: 'Location', optional: true },
  },
};

export default Sensor;
