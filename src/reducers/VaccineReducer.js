import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  scannedSensors: [],
  isScanning: false,
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

      const { scannedSensors } = state;
      scannedSensors.push(macAddress);

      return {
        ...state,
        scannedSensors,
      };
    }
    default:
      return state;
  }
};
