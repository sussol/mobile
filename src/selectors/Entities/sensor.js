import { selectSpecificEntityState } from './index';

export const selectNewSensor = state => {
  const sensorState = selectSpecificEntityState(state, 'sensor');
  const { newId, byId } = sensorState;
  return byId[newId];
};

export const selectEditingSensor = state => {
  const sensorState = selectSpecificEntityState(state, 'sensor');
  const { editingId, byId } = sensorState;
  return byId[editingId];
};

export const selectNewSensorId = state => {
  const sensorState = selectSpecificEntityState(state, 'sensor');
  const { newId } = sensorState;

  return newId;
};
