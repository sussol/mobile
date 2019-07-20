import { NativeModules } from 'react-native';
import { parseSensorAdvertisment } from './temperatureSensorHelpers';

const MANUFACTURER_ID = 307;
const SENSOR_SCAN_TIMEOUT = 10000;

/* eslint-disable import/prefer-default-export */
export async function scanForSensors() {
  // Initiate a BLE scan for devices, returning all sensors found
  // which match the provided manufacturers ID. Returns an array
  // of sensor advertisement data from all sensors found. In the
  // shape:
  // { batteryLevel, temperature, logInterval, numberOfLogs
  //   lastConnectionTimestamp, name, macAddress }
  // @@TODO: Check return
  try {
    const { BleTempoDisc } = NativeModules;
    const sensors = await BleTempoDisc.getDevices(MANUFACTURER_ID, SENSOR_SCAN_TIMEOUT, '');
    return Object.entries(sensors).map(([macAddress, { name, advertismentData }]) => ({
      ...parseSensorAdvertisment(advertismentData),
      macAddress,
      name,
    }));
  } catch (e) {
    // @@TODO: Check error objects, log to bugsnag
    return null;
  }
}
