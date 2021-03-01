import { selectSpecificEntityState } from './index';

export const selectNewNameNote = state => {
  const NameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { newId, byId } = NameNoteState;
  return byId[newId];
};

export const selectNewNameNoteId = state => {
  const NameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { newId } = NameNoteState;
  return newId;
};

export const selectEditingNameNote = state => {
  const NameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { editingId, byId } = NameNoteState;
  return byId[editingId];
};
