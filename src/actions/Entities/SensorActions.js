import { LocationActions } from './LocationActions';
import { SensorManager } from '../../bluetooth';
import { TemperatureBreachConfigActions } from './TemperatureBreachConfigActions';
import { UIDatabase } from '../../database/index';
import { selectNewSensorId } from '../../selectors/Entities/sensor';

export const SENSOR_ACTIONS = {
  CREATE: 'SENSOR/create',
  UPDATE: 'SENSOR/update',
  RESET_NEW: 'SENSOR/resetNew',
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

const updateCode = (id, code, isNew = false) => dispatch => {
  const isValid = code?.length < 50;

  if (!isValid) return;

  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('Sensor', { id, code });
    });
  }

  dispatch(update(id, 'code', code));
};

const updateName = (id, name, isNew = false) => dispatch => {
  const isValid = name?.length < 50;

  if (!isValid) return;

  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('Sensor', { id, name });
    });
  }

  dispatch(update(id, 'name', name));
};

const updateLogInterval = (id, logInterval, isNew = false) => dispatch => {
  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('Sensor', { id, logInterval });
    });
  }

  dispatch(update(id, 'logInterval', logInterval));
};

const updateLoggingDelay = (id, loggingDelay, isNew = false) => dispatch => {
  if (!isNew) {
    UIDatabase.write(() => {
      UIDatabase.update('Sensor', { id, loggingDelay });
    });
  }

  dispatch(update(id, 'loggingDelay', loggingDelay));
};

const updateNewSensorName = value => (dispatch, getState) => {
  const state = getState();
  const newId = selectNewSensorId(state);
  dispatch(updateName(newId, value, true));
};
const updateNewSensorCode = value => (dispatch, getState) => {
  const state = getState();
  const newId = selectNewSensorId(state);
  dispatch(updateCode(newId, value, true));
};

const updateNewSensorLoggingDelay = value => (dispatch, getState) => {
  const state = getState();
  const newId = selectNewSensorId(state);
  dispatch(updateLoggingDelay(newId, value, true));
};

const updateNewSensorLogInterval = value => (dispatch, getState) => {
  const state = getState();
  const newId = selectNewSensorId(state);
  dispatch(updateLogInterval(newId, value, true));
};

export const SensorActions = {
  create,
  createFromScanner,
  updateCode,
  updateName,
  updateLogInterval,
  updateLoggingDelay,
  updateNewSensorName,
  updateNewSensorCode,
  updateNewSensorLoggingDelay,
  updateNewSensorLogInterval,
  resetNew,
};
