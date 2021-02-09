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

  get hasBreached() {
    return this.location?.hasBreached ?? false;
  }

  get mostRecentTemperatureBreach() {
    return this.location?.mostRecentTemperatureBreach;
  }

  get batteryLevelString() {
    return `${this.batteryLevel}%`;
  }

  get currentLocationName() {
    return this.location?.description ?? '';
  }

  get mostRecentLog() {
    return this.logs.sorted('timestamp', true)[0];
  }

  get lastSyncDate() {
    const { timestamp = new Date(0) } = this.mostRecentLog ?? {};

    return timestamp;
  }

  get maxTemperature() {
    return this.logs.max('temperature');
  }

  get minTemperature() {
    return this.logs.min('temperature');
  }

  get numberOfBreaches() {
    return this.breaches.length;
  }

  get breachConfigs() {
    return this.location?.breachConfigs;
  }

  get firstLog() {
    return this.logs.sorted('timestamp', false)[0];
  }

  get mostRecentBreach() {
    return this.breaches.sorted('startTimestamp', true)[0];
  }

  get mostRecentBreachTime() {
    return this.mostRecentBreach?.startTimestamp;
  }

  get currentTemperature() {
    return this.mostRecentLog?.temperature;
  }

  get isInHotBreach() {
    const breach = this.mostRecentBreach;
    const isOngoing = !!breach?.endTimestamp;
    const isHot = breach?.type === 'HOT_CONSECUTIVE';

    return isOngoing && isHot;
  }

  get isInColdBreach() {
    const breach = this.mostRecentBreach;
    const isOngoing = !!breach?.endTimestamp;
    const isHot = breach?.type === 'COLD_CONSECUTIVE';

    return isOngoing && isHot;
  }
}

Sensor.schema = {
  name: 'Sensor',
  primaryKey: 'id',
  properties: {
    id: 'string',
    macAddress: { type: 'string', optional: true },
    name: { type: 'string', default: '' },
    location: { type: 'Location', optional: true },
    batteryLevel: { type: 'double', default: 0 },
    logs: { type: 'linkingObjects', objectType: 'TemperatureLog', property: 'sensor' },
    breaches: { type: 'linkingObjects', objectType: 'TemperatureBreach', property: 'sensor' },
    isActive: { type: 'bool', default: true },
    logInterval: { type: 'int', default: 300 },
    logDelay: { type: 'date', default: new Date(0) },
    programmedDate: { type: 'date', default: new Date() },
  },
};

export default Sensor;
