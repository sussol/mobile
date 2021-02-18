/* eslint-disable max-len */
import { TEMPERATURE_BREACH_CONFIG_ACTIONS } from '../../actions/Entities/TemperatureBreachConfigActions';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';
import { SYNC_TRANSACTION_COMPLETE } from '../../sync/constants';

// Extracts the required fields of a realm instance into a plain JS object
// which is more suitable to store in redux as immutable updates are simpler.
const getPlainTemperatureBreachConfiguration = config => ({
  id: config.id,
  minimumTemperature: config.minimumTemperature,
  maximumTemperature: config.maximumTemperature,
  duration: config.duration,
  description: config.description,
  colour: config.colour,
  locationID: config.location?.id,
  type: config.type,
});

const getById = () =>
  UIDatabase.objects('TemperatureBreachConfiguration').reduce(
    (acc, config) => ({
      ...acc,
      [config.id]: getPlainTemperatureBreachConfiguration(config),
    }),
    {}
  );

const initialState = () => ({
  byId: getById(),
  newIds: [],
  editingIds: [],
});

export const TemperatureBreachConfigReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case SYNC_TRANSACTION_COMPLETE: {
      const newById = getById();
      return { ...state, byId: newById };
    }

    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;
      const { breachConfigIDs } = sensor;

      return { ...state, editingIds: breachConfigIDs };
    }

    case TEMPERATURE_BREACH_CONFIG_ACTIONS.CREATE_GROUP: {
      const { byId } = state;
      const { payload } = action;

      const newIds = payload.map(({ id }) => id);
      const newByIds = payload.reduce(
        (acc, newConfig) => ({
          ...acc,
          [newConfig.id]: getPlainTemperatureBreachConfiguration(newConfig),
        }),
        byId
      );

      return { ...state, byId: newByIds, newIds };
    }
    case TEMPERATURE_BREACH_CONFIG_ACTIONS.RESET: {
      return initialState();
    }

    case TEMPERATURE_BREACH_CONFIG_ACTIONS.SAVE_NEW_GROUP: {
      const { byId } = state;
      const { payload } = action;
      const { configs } = payload;

      const newById = configs.reduce(
        (acc, config) => ({
          ...acc,
          [config.id]: config,
        }),
        byId
      );

      return { ...state, byId: newById, newIds: [] };
    }

    case TEMPERATURE_BREACH_CONFIG_ACTIONS.SAVE_EDITING_GROUP: {
      const { byId } = state;
      const { payload } = action;
      const { configs } = payload;

      const newById = configs.reduce(
        (acc, config) => ({
          ...acc,
          [config.id]: getPlainTemperatureBreachConfiguration(config),
        }),
        byId
      );

      return { ...state, byId: newById, editingIds: [] };
    }

    case TEMPERATURE_BREACH_CONFIG_ACTIONS.UPDATE: {
      const { byId } = state;
      const { payload } = action;
      const { id, field, value } = payload;

      const oldConfig = byId[id];
      const newConfig = { ...oldConfig, [field]: value };
      const newByIds = { ...byId, [id]: newConfig };

      return { ...state, byId: newByIds };
    }

    default: {
      return state;
    }
  }
};
