import { ToastAndroid } from 'react-native';

import { VACCINE_ACTIONS } from '../actions/VaccineActions';
import BleService from '../bluetooth/BleService';

const initialState = () => ({
  isScanning: false,
  scannedSensorAddresses: [],
});

const blinkSensor = async macAddress => {
  const error = null;
  await BleService().blinkWithRetries(macAddress, 3, error);
  if (error) {
    const { message } = error;
    ToastAndroid.show(message || error, ToastAndroid.LONG);
  }
};

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_ACTIONS.BLINK: {
      const { payload } = action;
      const { macAddress } = payload;
      const { sensors } = state;
      const sensor = sensors.find(s => s.macAddress === macAddress) || {
        macAddress,
        blinking: false,
      };

      blinkSensor(macAddress);
      sensor.blinking = true;

      return { ...state, sensors: [...sensors.filter(s => s.macAddress !== macAddress), sensor] };
    }
    case VACCINE_ACTIONS.SCAN_START: {
      return {
        ...state,
        isScanning: true,
      };
    }
    case VACCINE_ACTIONS.SCAN_STOP: {
      return {
        ...state,
        isScanning: false,
      };
    }
    case VACCINE_ACTIONS.SENSOR_FOUND: {
      const { payload } = action;
      const { macAddress } = payload;

      const { scannedSensorAddresses } = state;

      return {
        ...state,
        scannedSensorAddresses: [...scannedSensorAddresses, macAddress],
      };
    }
    default:
      return state;
  }
};
