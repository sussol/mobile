import { VACCINE_CONSTANTS } from '../../utilities/modules/vaccines/index';
import { selectSpecificEntityState } from './index';

export const selectSensorState = state => selectSpecificEntityState(state, 'sensor');

export const selectSensorsById = state => {
  const sensorState = selectSensorState(state);
  const { byId } = sensorState;
  return byId;
};

export const selectSensors = state => {
  const sensorsById = selectSensorsById(state);
  return Object.values(sensorsById);
};

export const selectSensorById = (state, sensorId) => {
  const sensors = selectSensors(state);
  const foundSensor = sensors.find(({ id }) => id === sensorId);
  return foundSensor;
};

export const selectActiveSensors = state => {
  const sensors = selectSensors(state);
  const filtered = sensors.filter(({ isActive }) => isActive);
  return filtered;
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

export const selectReplacedSensor = state => {
  const sensorState = selectSensorState(state);
  const { replacedId, byId } = sensorState;
  return byId[replacedId];
};

export const selectNewSensorId = state => {
  const sensorState = selectSensorState(state);
  const { newId } = sensorState;

  return newId;
};

export const selectIsLowBatteryById = (state, id) => {
  const sensor = selectSensorById(state, id) ?? {};
  const { batteryLevel } = sensor;
  return batteryLevel && batteryLevel <= VACCINE_CONSTANTS.LOW_BATTERY_PERCENTAGE;
};

export const selectIsInHotBreachById = (state, id) => {
  const sensor = selectSensorById(state, id) ?? {};
  const { isInHotBreach } = sensor;
  return !!isInHotBreach;
};

export const selectIsInColdBreachById = (state, id) => {
  const sensor = selectSensorById(state, id) ?? {};
  const { isInColdBreach } = sensor;
  return !!isInColdBreach;
};

export const selectIsInBreachById = (state, id) => {
  const sensor = selectSensorById(state, id) ?? {};
  const { isInHotBreach, isInColdBreach } = sensor;
  return !!isInHotBreach || !!isInColdBreach;
};

export const selectIsInDangerById = (state, id) => {
  const isLowBattery = selectIsLowBatteryById(state, id);
  const isInBreach = selectIsInBreachById(state, id);
  return isLowBattery || isInBreach;
};

export const selectCurrentTemperatureById = (state, id) => {
  const sensor = selectSensorById(state, id);
  const { currentTemperature } = sensor;
  return currentTemperature;
};
