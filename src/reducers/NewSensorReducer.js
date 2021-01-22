import { NEW_SENSOR_ACTIONS, VACCINE_ACTIONS } from '../actions';

const initialState = () => ({
  macAddress: '',
});

export const NewSensorReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case NEW_SENSOR_ACTIONS.SELECT: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, macAddress };
    }

    case VACCINE_ACTIONS.SCAN_START: {
      return initialState();
    }

    default:
      return state;
  }
};
