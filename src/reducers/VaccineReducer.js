import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isScanning: false,
  scannedSensorAddresses: [],
  setLogIntervalFor: '',
});

export const VaccineReducer = (state = initialState(), action) => {
  const { type } = action;
  switch (type) {
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

      const { scannedSensorAddresses = [] } = state;

      return {
        ...state,
        scannedSensorAddresses: [...scannedSensorAddresses, macAddress],
      };
    }

    case VACCINE_ACTIONS.SET_LOG_INTERVAL_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, setLogIntervalFor: macAddress };
    }

    case VACCINE_ACTIONS.SET_LOG_INTERVAL_SUCCESS:
    case VACCINE_ACTIONS.SET_LOG_INTERVAL_ERROR: {
      return { ...state, setLogIntervalFor: '' };
    }

    default:
      return state;
  }
};
