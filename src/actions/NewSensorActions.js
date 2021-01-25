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

export const NewSensorActions = {
  select,
  updateConfig,
  updateLoggingDelay,
  updateLogInterval,
  updateName,
  updateCode,
};
