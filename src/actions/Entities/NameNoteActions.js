import { generateUUID } from 'react-native-database';
import { UIDatabase } from '../../database/index';
import { selectEditingNameNote, selectNewNameNoteId } from '../../selectors/Entities/nameNote';
import { selectEditingNameId } from '../../selectors/Entities/name';

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

const saveNewSurvey = surveyData => (dispatch, getState) => {
  const nameNote = createDefaultNameNote();
  const nameId = selectEditingNameId(getState());
  const patientEvents = UIDatabase.objects('PCDEvents');

  if (patientEvents.length === 0) return;
  const [patientEvent] = patientEvents;

  nameNote.data = surveyData;
  nameNote.patientEvent = patientEvent.id;
  nameNote.name = nameId;

  dispatch({
    type: NAME_NOTE_ACTIONS.SAVE_NEW,
    payload: { nameNote },
  });
};

const saveEditing = () => (dispatch, getState) => {
  const currentNameNote = selectEditingNameNote(getState());
  const name = UIDatabase.get('Name', currentNameNote.name);
  const patientEvent = UIDatabase.get('PatientEvent', currentNameNote.patientEvent);

  if (name && patientEvent) {
    const newNameNote = { ...currentNameNote, patientEvent, name };
    UIDatabase.write(() => UIDatabase.create('NameNote', newNameNote));
    dispatch(reset());
  }
};

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
