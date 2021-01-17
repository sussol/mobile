import { VACCINE_ACTIONS } from '../actions/VaccineActions';

const initialState = () => ({
  sensors: [],
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
        isaScanning: false,
      };
    }
    default:
      return state;
  }
};
