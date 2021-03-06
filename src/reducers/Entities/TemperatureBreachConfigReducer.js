/* eslint-disable max-len */
import { TEMPERATURE_BREACH_CONFIG_ACTIONS } from '../../actions/Entities/TemperatureBreachConfigActions';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';
import { INITIALISE_FINISHED, SYNC_TRANSACTION_COMPLETE } from '../../sync/constants';

const getById = () =>
  UIDatabase.objects('TemperatureBreachConfiguration').reduce(
    (acc, config) => ({
      ...acc,
      [config.id]: config.toJSON(),
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
    case INITIALISE_FINISHED:
    case SYNC_TRANSACTION_COMPLETE: {
      const { byId } = state;

      const newById = getById();
      const mergedById = { ...byId, ...newById };

      return { ...state, byId: mergedById };
    }

    case 'NAVIGATE': {
      const { payload } = action;
      const { params, name } = payload;

      if (name !== ROUTES.SENSOR_EDIT) return state;
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
          [newConfig.id]: newConfig,
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
          [config.id]: config.toJSON(),
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
          [config.id]: config.toJSON(),
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
