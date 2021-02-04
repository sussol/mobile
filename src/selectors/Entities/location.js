import { selectSpecificEntityState } from './index';

export const selectNewLocation = state => {
  const locationState = selectSpecificEntityState(state, 'location');
  const { newId, byId } = locationState;
  return byId[newId];
};

export const selectNewLocationId = state => {
  const locationState = selectSpecificEntityState(state, 'location');
  const { newId } = locationState;
  return newId;
};

export const selectEditingLocation = state => {
  const locationState = selectSpecificEntityState(state, 'location');
  const { editingId, byId } = locationState;
  return byId[editingId];
};
