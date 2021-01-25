import { SENSOR_DETAIL_ACTIONS } from '../actions/SensorDetailActions';
import { ROUTES } from '../navigation/index';
import { SECONDS } from '../utilities/constants';

const initialState = sensor => ({
  name: sensor?.name ?? '',
  code: sensor?.location?.code ?? '',
  macAddress: sensor?.macAddress ?? '',
  logInterval: sensor?.logInterval ?? 0,
  HOT_CUMULATIVE: { duration: 0, threshold: 99, temperature: 2 },
  HOT_CONSECUTIVE: { duration: 0, threshold: 99, temperature: 2 },
  COLD_CUMULATIVE: { duration: 0, threshold: 99, temperature: 2 },
  COLD_CONSECUTIVE: { duration: 0, threshold: 99, temperature: 2 },
  batteryLevel: sensor?.batteryLevel ?? 0,
  lastSyncDate: sensor?.lastSyncDate ?? new Date(),
});

export const SensorDetailReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;

      return initialState(sensor);
    }

    case SENSOR_DETAIL_ACTIONS.UPDATE_NAME: {
      const { payload } = action;
      const { name } = payload;

      return { ...state, name };
    }
    case SENSOR_DETAIL_ACTIONS.UPDATE_CODE: {
      const { payload } = action;
      const { code } = payload;

      return { ...state, code };
    }
    case SENSOR_DETAIL_ACTIONS.UPDATE_LOG_INTERVAL: {
      const { payload } = action;
      const { logInterval } = payload;

      return { ...state, logInterval: logInterval * SECONDS.ONE_MINUTE };
    }
    case SENSOR_DETAIL_ACTIONS.UPDATE_CONFIG: {
      const { payload } = action;
      const { configType, configField, value } = payload;

      const config = state[configType];

      if (configField === 'duration') {
        const newConfig = { ...config, [configField]: value * SECONDS.ONE_MINUTE };
        return { ...state, [configType]: newConfig };
      }

      const newConfig = { ...config, [configField]: value };
      return { ...state, [configType]: newConfig };
    }

    default:
      return state;
  }
};
