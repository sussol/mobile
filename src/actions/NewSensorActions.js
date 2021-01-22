export const NEW_SENSOR_ACTIONS = {
  SELECT: 'SensorActions/select',
};

const select = macAddress => ({ type: NEW_SENSOR_ACTIONS.SELECT, payload: { macAddress } });

export const NewSensorActions = { select };
