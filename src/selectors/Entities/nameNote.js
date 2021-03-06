import { selectSpecificEntityState } from './index';

export const selectNewNameNote = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creatingId, creatingById } = nameNoteState;
  return creatingById[creatingId];
};

export const selectNewNameNoteId = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creatingId } = nameNoteState;
  return creatingId;
};

export const selectEditingNameNote = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { editingId, editingById } = nameNoteState;
  return editingById[editingId];
};

export const selectNameNoteIsValid = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creatingById, creatingId } = nameNoteState;
  const { isValid = false } = creatingById[creatingId] ?? {};
  return isValid;
};
