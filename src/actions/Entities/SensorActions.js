import { batch } from 'react-redux';
import { SensorManager } from '../../bluetooth';
import { UIDatabase } from '../../database/index';
import { createRecord } from '../../database/utilities/index';
import { selectNewLocation } from '../../selectors/Entities/location';
import { selectNewSensor, selectNewSensorId } from '../../selectors/Entities/sensor';
import { selectNewConfigs } from '../../selectors/Entities/temperatureBreachConfig';
import { LocationActions } from './LocationActions';
import { TemperatureBreachConfigActions } from './TemperatureBreachConfigActions';

export const SENSOR_ACTIONS = {
  CREATE: 'SENSOR/create',
  UPDATE: 'SENSOR/update',
  RESET_NEW: 'SENSOR/resetNew',
  SAVE_NEW: 'SENSOR/saveNew',
};

const createFromScanner = macAddress => dispatch => {
  dispatch(LocationActions.create());
  dispatch(TemperatureBreachConfigActions.createGroup());
  dispatch(SensorActions.create(macAddress));
};

const resetNew = () => ({ type: SENSOR_ACTIONS.RESET_NEW });

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
  resetNew,
  updateNewSensor,
  createNew,
  saveNew,
};
