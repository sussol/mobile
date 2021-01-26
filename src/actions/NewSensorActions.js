import { selectNewSensor } from '../selectors/newSensor';
import { VaccineActions } from './VaccineActions';
import { vaccineStrings } from '../localization';

export const NEW_SENSOR_ACTIONS = {
  SELECT: 'SensorActions/select',
  UPDATE_CONFIG: 'SensorActions/updateConfig',
  UPDATE_CODE: 'SensorActions/updateCode',
  UPDATE_NAME: 'SensorActions/updateName',
  UPDATE_LOG_INTERVAL: 'SensorActions/updateLogInterval',
  UPDATE_LOGGING_DELAY: 'SensorActions/updateLoggingDelay',
};

const select = macAddress => ({ type: NEW_SENSOR_ACTIONS.SELECT, payload: { macAddress } });

const updateConfig = (configType, configField, value) => ({
  type: NEW_SENSOR_ACTIONS.UPDATE_CONFIG,
  payload: { configField, configType, value },
});

const updateCode = code => ({ type: NEW_SENSOR_ACTIONS.UPDATE_CODE, payload: { code } });

const updateName = name => ({ type: NEW_SENSOR_ACTIONS.UPDATE_NAME, payload: { name } });

const updateLogInterval = logInterval => ({
  type: NEW_SENSOR_ACTIONS.UPDATE_LOG_INTERVAL,
  payload: { logInterval },
});

const updateLoggingDelay = loggingDelay => ({
  type: NEW_SENSOR_ACTIONS.UPDATE_LOGGING_DELAY,
  payload: { loggingDelay },
});

const updateSensor = () => (dispatch, getState) => {
  const sensor = selectNewSensor(getState());
  const { macAddress, logInterval } = sensor;

  return dispatch(VaccineActions.startSetLogInterval({ macAddress, logInterval })).then(() =>
    dispatch(VaccineActions.startSensorDisableButton(sensor.macAddress))
  );
};

const saveSensor = () => (dispatch, getState) => {
  const sensor = selectNewSensor(getState());

  return dispatch(VaccineActions.saveSensor(sensor)).catch(() => {
    throw new Error(vaccineStrings.E_SENSOR_SAVE);
  });
};

export const NewSensorActions = {
  saveSensor,
  select,
  updateConfig,
  updateLoggingDelay,
  updateLogInterval,
  updateName,
  updateCode,
  updateSensor,
};
