/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { generateUUID } from 'react-native-database';

import { UIDatabase } from '../database';
import { Sensor } from '../database/DataTypes';

export const TEMPERATURE_SYNC_ACTIONS = {
  SCAN_START: 'TemperatureSync/scanStart',
  SCAN_COMPLETE: 'TemperatureSync/scanComplete',
  SCAN_ERROR: 'TemperatureSync/scanError',
};

const scanStart = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_START });
const scanComplete = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_COMPLETE });
const scanError = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_ERROR });

const updateSensors = sensorAdvertisements => dispatch => {
  const isArray = Array.isArray(sensorAdvertisements);

  if (!isArray) dispatch(scanError());
  if (isArray && !sensorAdvertisements.length) dispatch(scanError());

  if (isArray && sensorAdvertisements.length) {
    sensorAdvertisements.forEach(({ macAddress, batteryLevel }) => {
      UIDatabase.write(() => {
        UIDatabase.update('Sensor', {
          id: generateUUID(),
          ...UIDatabase.get('Sensor', 'macAddress', macAddress),
          macAddress,
          batteryLevel,
        });
      });
    });
  }
};

const scanForSensors = () => async dispatch => {
  dispatch(scanStart());

  const sensorResult = await Sensor.startScan();
  const { success, data } = sensorResult;

  dispatch(updateSensors(data));

  if (success) dispatch(scanComplete());
};

export const TemperatureSyncActions = {
  scanForSensors,
};
