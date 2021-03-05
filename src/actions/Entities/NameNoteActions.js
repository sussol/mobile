import { generateUUID } from 'react-native-database';
import { UIDatabase } from '../../database/index';
import { selectNewNameNoteId } from '../../selectors/Entities/nameNote';

export const NAME_NOTE_ACTIONS = {
  CREATE: 'NAME_NOTE/create',
  UPDATE: 'NAME_NOTE/update',
  SAVE_NEW: 'NAME_NOTE/saveNew',
  SAVE_EDITING: 'NAME_NOTE/saveEditing',
  RESET: 'NAME_NOTE/reset',
  UPDATE_DATA: 'NAME_NOTE/updateData',
};

const createDefaultNameNote = () => ({
  id: generateUUID(),
  entryDate: new Date(),
  name: '',
  patientEvent: '',
});

const createFromExisting = nameID => dispatch => {
  const name = UIDatabase.get('Name', nameID);
  const pcd = name?.mostRecentPCD;
  if (!(pcd || name)) dispatch(create());
  else dispatch(create(pcd.toObject()));
};

const create = (seed = createDefaultNameNote()) => ({
  type: NAME_NOTE_ACTIONS.CREATE,
  payload: { nameNote: seed },
});

const updateForm = (data, errors) => ({
  type: NAME_NOTE_ACTIONS.UPDATE_DATA,
  payload: { data, errors },
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
  update,
  updateNew,
  saveNew,
  saveEditing,
  saveNewSurvey,
  reset,
  createFromExisting,
  updateForm,
};
