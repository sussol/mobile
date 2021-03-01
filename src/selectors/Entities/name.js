import { selectSpecificEntityState } from './index';

export const selectEditingNameId = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { editing } = NameState;
  const { id } = editing;
  return id;
};

export const selectEditingName = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { editing } = NameState;
  return editing;
};
