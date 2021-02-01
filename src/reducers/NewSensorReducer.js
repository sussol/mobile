import moment from 'moment';
import { NEW_SENSOR_ACTIONS, VACCINE_ACTIONS } from '../actions';

const initialState = () => ({
  macAddress: '',
  code: '',
  name: '',
  loggingDelay: moment(new Date()).add(5, 'minutes').toDate(),
  logInterval: 5,
  HOT_CUMULATIVE: { duration: 20, temperature: 8 },
  COLD_CUMULATIVE: { duration: 20, temperature: 2 },
  HOT_CONSECUTIVE: { duration: 20, temperature: 8 },
  COLD_CONSECUTIVE: { duration: 20, temperature: 2 },
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

    case NEW_SENSOR_ACTIONS.UPDATE_LOG_INTERVAL: {
      const { payload } = action;
      const { logInterval } = payload;

      return { ...state, logInterval };
    }

    case NEW_SENSOR_ACTIONS.UPDATE_LOGGING_DELAY: {
      const { payload } = action;
      const { loggingDelay } = payload;

      return { ...state, loggingDelay };
    }

    case NEW_SENSOR_ACTIONS.UPDATE_NAME: {
      const { payload } = action;
      const { name } = payload;

      const isValid = name.length < 50;
      if (!isValid) return state;

      return { ...state, name };
    }

    case NEW_SENSOR_ACTIONS.UPDATE_CODE: {
      const { payload } = action;
      const { code } = payload;

      const isValid = code.length < 10;
      if (!isValid) return state;

      return { ...state, code };
    }

    default:
      return state;
  }
};
