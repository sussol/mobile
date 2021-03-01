import { selectSpecificEntityState } from './index';

export const selectNewNameNote = state => {
  const NameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creatingId, creatingById } = NameNoteState;
  return creatingById[creatingId];
};

export const selectNewNameNoteId = state => {
  const NameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creatingId } = NameNoteState;
  return creatingId;
};

export const selectEditingNameNote = state => {
  const NameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { editingId, editingById } = NameNoteState;
  return editingById[editingId];
};
