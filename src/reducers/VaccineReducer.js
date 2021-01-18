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
      const { scannedSensors } = state;
      const updatedSensorList = scannedSensors.push(payload);

      return {
        ...state,
        scannedSensors: updatedSensorList,
      };
    }
    default:
      return state;
  }
};
