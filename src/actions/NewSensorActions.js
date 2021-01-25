export const NEW_SENSOR_ACTIONS = {
  SELECT: 'SensorActions/select',
  UPDATE_CONFIG: 'SensorActions/updateConfig',
};

const select = macAddress => ({ type: NEW_SENSOR_ACTIONS.SELECT, payload: { macAddress } });

const updateConfig = (configType, configField, value) => ({
  type: NEW_SENSOR_ACTIONS.UPDATE_CONFIG,
  payload: { configField, configType, value },
});

export const NewSensorActions = { select, updateConfig };
