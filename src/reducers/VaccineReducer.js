import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  isScanning: false,
  scannedSensorAddresses: [],
  setLogFrequencyFor: '',
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

    case VACCINE_ACTIONS.SET_LOG_FREQUENCY_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, setLogFrequencyFor: macAddress };
    }

    case VACCINE_ACTIONS.SET_LOG_FREQUENCY_SUCCESS:
    case VACCINE_ACTIONS.SET_LOG_FREQUENCY_ERROR: {
      return { ...state, setLogFrequencyFor: '' };
    }

    default:
      return state;
  }
};
