import { selectSpecificEntityState } from './index';

export const selectSensorState = state => selectSpecificEntityState(state, 'sensor');

export const selectSensorsById = state => {
  const sensorState = selectSensorState(state);
  const { byId } = sensorState;
  return byId;
};

export const selectSensorByMac = (state, mac) => {
  const sensorsById = selectSensorsById(state);
  const foundSensor = Object.values(sensorsById).find(({ macAddress }) => macAddress === mac);
  return foundSensor;
};

export const selectNewSensor = state => {
  const sensorState = selectSensorState(state);
  const { newId, byId } = sensorState;
  return byId[newId];
};

export const selectEditingSensor = state => {
  const sensorState = selectSensorState(state);
  const { editingId, byId } = sensorState;
  return byId[editingId];
};

export const selectNewSensorId = state => {
  const sensorState = selectSensorState(state);
  const { newId } = sensorState;

  return newId;
};

export const selectSensors = state => {
  const sensorsById = selectSensorsById(state);
  return Object.values(sensorsById);
};

export const selectSensorIsDelayed = (state, mac) => {
  const sensor = selectSensorByMac(state, mac);
  const { logDelay } = sensor;
  const timeNow = new Date().getTime();
  const isDelayed = logDelay > timeNow;

  return isDelayed;
};
