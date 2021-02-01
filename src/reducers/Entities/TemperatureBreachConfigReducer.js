/* eslint-disable max-len */
import { TEMPERATURE_BREACH_CONFIG_ACTIONS } from '../../actions/Entities/TemperatureBreachConfigActions';
import { UIDatabase } from '../../database';

const initialState = () => ({
  byId: UIDatabase.objects('TemperatureBreachConfiguration').reduce(
    (acc, config) => ({
      ...acc,
      [config.id]: config,
    }),
    {}
  ),
  newIds: [],
});

export const TemperatureBreachConfigReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case TEMPERATURE_BREACH_CONFIG_ACTIONS.CREATE_GROUP: {
      const { byId } = state;
      const { payload } = action;

      const newIds = payload.map(({ id }) => id);
      const newByIds = payload.reduce(
        (acc, newConfig) => ({ ...acc, [newConfig.id]: newConfig }),
        byId
      );

      return { ...state, byId: newByIds, newIds };
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
