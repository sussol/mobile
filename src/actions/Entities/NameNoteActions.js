import { generateUUID } from 'react-native-database';
import { UIDatabase } from '../../database/index';
import { selectNewNameNoteId } from '../../selectors/Entities/nameNote';

export const NAME_NOTE_ACTIONS = {
  CREATE: 'NAME_NOTE/create',
  UPDATE: 'NAME_NOTE/update',
  SAVE_NEW: 'NAME_NOTE/saveNew',
  SAVE_EDITING: 'NAME_NOTE/saveEditing',
  RESET: 'NAME_NOTE/reset',
};

const createDefaultNameNote = () => ({
  id: generateUUID(),
  entryDate: new Date(),
  name: '',
  patientEvent: '',
});

const create = () => ({
  type: NAME_NOTE_ACTIONS.CREATE,
  payload: { nameNote: createDefaultNameNote() },
});

const edit = nameNote => ({
  type: NAME_NOTE_ACTIONS.EDIT,
  payload: { nameNote },
});

const reset = () => ({
  type: NAME_NOTE_ACTIONS.RESET,
});

const update = (id, field, value) => ({
  type: NAME_NOTE_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const saveNew = nameNote => ({
  type: NAME_NOTE_ACTIONS.SAVE_NEW,
  payload: { nameNote },
});

const saveNewSurvey = surveyData => dispatch => {
  const nameNote = createDefaultNameNote();
  const patientEvents = UIDatabase.objects('PCDEvents');

  if (patientEvents.length === 0) return;
  const [patientEvent] = patientEvents;

  nameNote.data = surveyData;
  nameNote.patientEvent = patientEvent.id;

  dispatch({
    type: NAME_NOTE_ACTIONS.SAVE_NEW,
    payload: { nameNote },
  });
};

const saveEditing = nameNote => ({
  type: NAME_NOTE_ACTIONS.SAVE_EDITING,
  payload: { nameNote },
});

const updateNew = (value, field) => (dispatch, getState) => {
  const newNameId = selectNewNameNoteId(getState());
  dispatch(update(newNameId, field, value));
};

export const NameNoteActions = {
  create,
  edit,
  update,
  updateNew,
  saveNew,
  saveEditing,
  saveNewSurvey,
  reset,
};
