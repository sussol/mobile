import { generateUUID } from 'react-native-database';
import { UIDatabase } from '../../database/index';
import { selectNewConfigsByType } from '../../selectors/Entities/temperatureBreachConfig';
import { SECONDS } from '../../utilities/constants';

export const TEMPERATURE_BREACH_CONFIG_ACTIONS = {
  CREATE_GROUP: 'TEMPERATURE_BREACH_CONFIG/createGroup',
  UPDATE: 'TEMPERATURE_BREACH_CONFIG/update',
  RESET_NEW_GROUP: 'TEMPERATURE_BREACH_CONFIG/resetNewGroup',
};

const isHot = type => type.includes('HOT');

const createDefaultConfig = type => ({
  id: generateUUID(),
  minimumTemperature: isHot(type) ? 8 : -999,
  maximumTemperature: isHot(type) ? 999 : 2,
  type,
  duration: SECONDS.ONE_MINUTE * 20,
});

const resetNewGroup = () => ({ type: TEMPERATURE_BREACH_CONFIG_ACTIONS.RESET_NEW_GROUP });

const createGroup = () => ({
  type: TEMPERATURE_BREACH_CONFIG_ACTIONS.CREATE_GROUP,
  payload: [
    createDefaultConfig('HOT_CONSECUTIVE'),
    createDefaultConfig('COLD_CONSECUTIVE'),
    createDefaultConfig('HOT_CUMULATIVE'),
    createDefaultConfig('COLD_CUMULATIVE'),
  ],
});

const updateConfig = (id, field, value) => ({
  type: TEMPERATURE_BREACH_CONFIG_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const updateDuration = (id, duration, isNew) => dispatch => {
  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('TemperatureBreachConfiguration', { id, duration });
    });
  }

  dispatch(updateConfig(id, 'duration', duration));
};

const updateMinimumTemperature = (id, minimumTemperature, isNew) => dispatch => {
  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('TemperatureBreachConfiguration', { id, minimumTemperature });
    });
  }

  dispatch(updateConfig(id, 'minimumTemperature', minimumTemperature));
};

const updateMaximumTemperature = (id, maximumTemperature, isNew) => dispatch => {
  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('TemperatureBreachConfiguration', { id, maximumTemperature });
    });
  }

  dispatch(updateConfig(id, 'maximumTemperature', maximumTemperature));
};

const updateNewConfigDuration = (type, duration) => (dispatch, getState) => {
  const configs = selectNewConfigsByType(getState());
  const config = configs[type];
  const { id } = config;
  dispatch(updateDuration(id, duration * SECONDS.ONE_MINUTE, true));
};

const updateNewConfigTemperature = (type, temperature) => (dispatch, getState) => {
  const configs = selectNewConfigsByType(getState());
  const config = configs[type];
  const { id } = config;

  const action = isHot(type) ? updateMinimumTemperature : updateMaximumTemperature;
  dispatch(action(id, temperature, true));
};

export const TemperatureBreachConfigActions = {
  createGroup,
  updateConfig,
  updateDuration,
  updateMaximumTemperature,
  updateMinimumTemperature,
  updateNewConfigTemperature,
  updateNewConfigDuration,
  resetNewGroup,
};
