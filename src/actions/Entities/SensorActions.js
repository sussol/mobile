import { batch } from 'react-redux';
import { SensorManager } from '../../bluetooth';
import { UIDatabase } from '../../database';
import { createRecord } from '../../database/utilities';
import { selectEditingLocation, selectNewLocation } from '../../selectors/Entities/location';
import {
  selectEditingSensor,
  selectNewSensor,
  selectNewSensorId,
} from '../../selectors/Entities/sensor';
import {
  selectEditingConfigs,
  selectNewConfigs,
} from '../../selectors/Entities/temperatureBreachConfig';
import { LocationActions } from './LocationActions';
import { TemperatureBreachConfigActions } from './TemperatureBreachConfigActions';

export const SENSOR_ACTIONS = {
  CREATE: 'SENSOR/create',
  UPDATE: 'SENSOR/update',
  RESET: 'SENSOR/reset',
  SAVE_NEW: 'SENSOR/saveNew',
  SAVE_EDITING: 'SENSOR/saveEditing',
};

const createFromScanner = macAddress => dispatch => {
  dispatch(LocationActions.create());
  dispatch(TemperatureBreachConfigActions.createGroup());
  dispatch(SensorActions.create(macAddress));
};

const reset = () => ({ type: SENSOR_ACTIONS.RESET });

const update = (id, field, value) => ({
  type: SENSOR_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const create = macAddress => async dispatch => {
  const defaultSensor = { location: {}, logInterval: 300, macAddress, name: '' };
  const payload = await SensorManager().createSensor(defaultSensor);
  dispatch({ type: SENSOR_ACTIONS.CREATE, payload });
};

const updateNewSensor = (value, field) => (dispatch, getState) => {
  const state = getState();
  const newId = selectNewSensorId(state);
  dispatch(update(newId, field, value));
};

const saveNew = sensor => ({
  type: SENSOR_ACTIONS.SAVE_NEW,
  payload: { sensor },
});

const saveEditing = sensor => ({
  type: SENSOR_ACTIONS.SAVE_EDITING,
  payload: { sensor },
});

const save = () => (dispatch, getState) => {
  const fullState = getState();
  const location = selectEditingLocation(fullState);
  const sensor = selectEditingSensor(fullState);
  const configs = selectEditingConfigs(fullState);

  let updatedLocation;
  let updatedSensor;
  const updatedConfigs = [];
  UIDatabase.write(() => {
    updatedLocation = UIDatabase.update('Location', location);
    updatedSensor = UIDatabase.update('Sensor', sensor);
    configs.forEach(config =>
      updatedConfigs.push(UIDatabase.update('TemperatureBreachConfiguration', config))
    );
  });

  batch(() => {
    dispatch(saveEditing(updatedSensor));
    dispatch(LocationActions.saveEditing(updatedLocation));
    dispatch(TemperatureBreachConfigActions.saveEditingGroup(updatedConfigs));
  });
};

const createNew = () => (dispatch, getState) => {
  const fullState = getState();
  const location = selectNewLocation(fullState);
  const sensor = selectNewSensor(fullState);
  const configs = selectNewConfigs(fullState);

  let newLocation;
  let newConfigs;
  let newSensor;
  UIDatabase.write(() => {
    newLocation = createRecord(UIDatabase, 'Location', location);
    newSensor = createRecord(UIDatabase, 'Sensor', { ...sensor, location });
    newConfigs = configs.map(config =>
      createRecord(UIDatabase, 'TemperatureBreachConfiguration', { ...config, location })
    );
  });

  batch(() => {
    dispatch(saveNew(newSensor));
    dispatch(TemperatureBreachConfigActions.saveNewGroup(newConfigs));
    dispatch(LocationActions.saveNew(newLocation));
  });
};

export const SensorActions = {
  update,
  create,
  createFromScanner,
  reset,
  updateNewSensor,
  createNew,
  saveNew,
  save,
  saveEditing,
};
