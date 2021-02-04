import { generateUUID } from 'react-native-database';
import { selectNewConfigsByType } from '../../selectors/Entities/temperatureBreachConfig';
import { MILLISECONDS } from '../../utilities/constants';

export const TEMPERATURE_BREACH_CONFIG_ACTIONS = {
  CREATE_GROUP: 'TEMPERATURE_BREACH_CONFIG/createGroup',
  UPDATE: 'TEMPERATURE_BREACH_CONFIG/update',
  RESET: 'TEMPERATURE_BREACH_CONFIG/reset',
  SAVE_NEW_GROUP: 'TEMPERATURE_BREACH_CONFIG/saveNewGroup',
  SAVE_EDITING_GROUP: 'TEMPERATURE_BREACH_CONFIG/saveEditingGroup',
};

const isHot = type => type.includes('HOT');

const createDefaultConfig = type => ({
  id: generateUUID(),
  minimumTemperature: isHot(type) ? 8 : -999,
  maximumTemperature: isHot(type) ? 999 : 2,
  type,
  duration: 20 * MILLISECONDS.ONE_MINUTE,
});

const reset = () => ({ type: TEMPERATURE_BREACH_CONFIG_ACTIONS.RESET });

const createGroup = () => ({
  type: TEMPERATURE_BREACH_CONFIG_ACTIONS.CREATE_GROUP,
  payload: [
    createDefaultConfig('HOT_CONSECUTIVE'),
    createDefaultConfig('COLD_CONSECUTIVE'),
    createDefaultConfig('HOT_CUMULATIVE'),
    createDefaultConfig('COLD_CUMULATIVE'),
  ],
});

const update = (id, field, value) => ({
  type: TEMPERATURE_BREACH_CONFIG_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const saveEditingGroup = configs => ({
  type: TEMPERATURE_BREACH_CONFIG_ACTIONS.SAVE_EDITING_GROUP,
  payload: { configs },
});

const saveNewGroup = configs => ({
  type: TEMPERATURE_BREACH_CONFIG_ACTIONS.SAVE_NEW_GROUP,
  payload: { configs },
});

const updateNewConfig = (type, field, value) => (dispatch, getState) => {
  const configs = selectNewConfigsByType(getState());
  const config = configs[type];
  const { id } = config;
  dispatch(update(id, field, value));
};

export const TemperatureBreachConfigActions = {
  createGroup,
  reset,
  update,
  updateNewConfig,
  saveNewGroup,
  saveEditingGroup,
};
