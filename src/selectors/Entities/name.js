import { selectSpecificEntityState } from './index';

export const selectNewName = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { newId, byId } = NameState;
  return byId[newId];
};

export const selectNewNameId = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { newId } = NameState;
  return newId;
};

export const selectEditingName = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { editingId, byId } = NameState;
  return byId[editingId];
};
