import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isScanning: false,
  isSyncingTemps: false,
  scannedSensorAddresses: [],
  sendingBlinkTo: '',
});

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_ACTIONS.BLINK_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, sendingBlinkTo: macAddress };
    }

    case VACCINE_ACTIONS.BLINK_STOP: {
      return { ...state, sendingBlinkTo: '' };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, isSyncingTemps: true };
    }

    case VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, isSyncingTemps: false };
    }

    case VACCINE_ACTIONS.SCAN_START: {
      return {
        ...state,
        isScanning: true,
        scannedSensorAddresses: [],
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

      const { scannedSensorAddresses = [] } = state;

      return {
        ...state,
        scannedSensorAddresses: [...scannedSensorAddresses, macAddress],
      };
    }

    default:
      return state;
  }
};
