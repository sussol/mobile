import { SensorManager } from '../../bluetooth';
import { TemperatureBreachConfigActions } from './TemperatureBreachConfigActions';
import { selectNewSensorId } from '../../selectors/Entities/sensor';

export const SENSOR_ACTIONS = {
  CREATE: 'SENSOR/create',
  UPDATE: 'SENSOR/update',
  RESET_NEW: 'SENSOR/resetNew',
};

const createFromScanner = macAddress => dispatch => {
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

export const SensorActions = {
  update,
  create,
  createFromScanner,
  resetNew,
  updateNewSensor,
};
