import { selectSpecificEntityState } from './index';

export const selectNewSensor = state => {
  const sensorState = selectSpecificEntityState(state, 'sensor');
  const { newId, byId } = sensorState;
  return byId[newId];
};

export const selectNewSensorId = state => {
  const sensorState = selectSpecificEntityState(state, 'sensor');
  const { newId } = sensorState;

  return newId;
};
