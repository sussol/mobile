import { NEW_SENSOR_ACTIONS, VACCINE_ACTIONS } from '../actions';

const initialState = () => ({
  macAddress: '',
  HOT_CUMULATIVE: { duration: 300, temperature: 8 },
  COLD_CUMULATIVE: { duration: 300, temperature: 2 },
  HOT_CONSECUTIVE: { duration: 300, temperature: 8 },
  COLD_CONSECUTIVE: { duration: 300, temperature: 2 },
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

    case NEW_SENSOR_ACTIONS.UPDATE_CONFIG: {
      const { payload } = action;
      const { configField, configType, value } = payload;

      const oldConfig = state[configType];
      const newConfig = { ...oldConfig, [configField]: value };

      return { ...state, [configType]: newConfig };
    }

    default:
      return state;
  }
};
