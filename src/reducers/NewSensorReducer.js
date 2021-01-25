import moment from 'moment';
import { NEW_SENSOR_ACTIONS, VACCINE_ACTIONS } from '../actions';
import { SECONDS } from '../utilities/constants';

const initialState = () => ({
  macAddress: '',
  code: '',
  name: '',
  loggingDelay: moment(new Date()).add(5, 'minutes').toDate(),
  logInterval: 300,
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

      if (configField === 'duration') {
        const newConfig = { ...oldConfig, [configField]: value * SECONDS.ONE_MINUTE };
        return { ...state, [configType]: newConfig };
      }

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

      return { ...state, name };
    }

    case NEW_SENSOR_ACTIONS.UPDATE_CODE: {
      const { payload } = action;
      const { code } = payload;

      return { ...state, code };
    }

    default:
      return state;
  }
};
