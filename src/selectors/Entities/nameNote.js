import { selectSpecificEntityState } from './index';

export const selectCreatingNameNote = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creating } = nameNoteState;
  return creating;
};

export const selectNameNoteIsValid = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { isValid = false } = nameNoteState ?? {};
  return isValid;
};
