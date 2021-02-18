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

export const selectSensorByMac = (state, mac) => {
  const sensors = selectSensors(state);
  const foundSensor = sensors.find(({ macAddress }) => macAddress === mac);
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

export const selectIsLowBatteryByMac = (state, mac) => {
  const sensor = selectSensorByMac(state, mac) ?? {};
  const { batteryLevel } = sensor;
  return batteryLevel && batteryLevel <= VACCINE_CONSTANTS.LOW_BATTERY_PERCENTAGE;
};

export const selectIsInHotBreachByMac = (state, mac) => {
  const sensor = selectSensorByMac(state, mac) ?? {};
  const { isInHotBreach } = sensor;
  return !!isInHotBreach;
};

export const selectIsInColdBreachByMac = (state, mac) => {
  const sensor = selectSensorByMac(state, mac) ?? {};
  const { isInColdBreach } = sensor;
  return !!isInColdBreach;
};

export const selectIsInBreachByMac = (state, mac) => {
  const sensor = selectSensorByMac(state, mac) ?? {};
  const { isInHotBreach, isInColdBreach } = sensor;
  return !!isInHotBreach || !!isInColdBreach;
};

export const selectIsInDangerByMac = (state, mac) => {
  const isLowBattery = selectIsLowBatteryByMac(state, mac);
  const isInBreach = selectIsInBreachByMac(state, mac);
  return isLowBattery || isInBreach;
};

export const selectCurrentTemperatureByMac = (state, mac) => {
  const sensor = selectSensorByMac(state, mac);
  const { currentTemperature } = sensor;
  return currentTemperature;
};
