export const SENSOR_DETAIL_ACTIONS = {
  UPDATE_NAME: 'SensorDetail/updateName',
  UPDATE_CODE: 'SensorDetail/updateCode',
  UPDATE_LOG_INTERVAL: 'SensorDetail/updateLogInterval',
  UPDATE_CONFIG: 'SensorDetail/updateConfig',
};

const updateName = name => ({ type: SENSOR_DETAIL_ACTIONS.UPDATE_NAME, payload: { name } });

const updateCode = code => ({ type: SENSOR_DETAIL_ACTIONS.UPDATE_CODE, payload: { code } });

const updateLogInterval = logInterval => ({
  type: SENSOR_DETAIL_ACTIONS.UPDATE_LOG_INTERVAL,
  payload: { logInterval },
});

const updateConfig = (configType, configField, value) => ({
  type: SENSOR_DETAIL_ACTIONS.UPDATE_CONFIG,
  payload: { configType, configField, value },
});

export const SensorDetailActions = {
  updateName,
  updateCode,
  updateLogInterval,
  updateConfig,
};
