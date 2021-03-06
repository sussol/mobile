import Ajv from 'ajv';
import { generateUUID } from 'react-native-database';
import { UIDatabase } from '../../database/index';
import { selectEditingNameNote, selectNewNameNoteId } from '../../selectors/Entities/nameNote';
import { selectEditingNameId } from '../../selectors/Entities/name';
import { selectSurveySchemas } from '../../selectors/formSchema';

const ajvOptions = {
  errorDataPath: 'property',
  allErrors: true,
  multipleOfPrecision: 8,
  schemaId: 'auto',
  unknownFormats: 'ignore',
  jsonPointers: true,
};

export const NAME_NOTE_ACTIONS = {
  CREATE: 'NAME_NOTE/create',
  UPDATE: 'NAME_NOTE/update',
  SAVE_NEW: 'NAME_NOTE/saveNew',
  SAVE_EDITING: 'NAME_NOTE/saveEditing',
  RESET: 'NAME_NOTE/reset',
  UPDATE_DATA: 'NAME_NOTE/updateData',
};

const validateData = (jsonSchema, data) => {
  const ajv = new Ajv(ajvOptions);
  const result = ajv.validate(jsonSchema, data);

  return result;
};

const createDefaultNameNote = (nameID = '') => {
  const [pcd] = UIDatabase.objects('PCDEvents');

  return {
    id: generateUUID(),
    entryDate: new Date(),
    isValid: false,
    data: {},
    patientEventID: pcd?.id ?? '',
    nameID,
  };
};

const createSurveyNameNote = nameID => (dispatch, getState) => {
  const name = UIDatabase.get('Name', nameID);

  // Create the seed PCD, which is either their most recently filled survey or
  // and empty object.
  const seedPCD = name?.mostRecentPCD ?? createDefaultNameNote(nameID);

  // Get the survey schema as we need an initial validation to determine if
  // the seed has any fields which are required to be filled.
  const [surveySchema = {}] = selectSurveySchemas(getState);
  const { jsonSchema } = surveySchema;
  const isValid = validateData(jsonSchema, seedPCD.data);

  if (seedPCD.toObject) {
    dispatch(create(seedPCD?.toObject(), isValid));
  } else {
    dispatch(create(seedPCD, isValid));
  }
};

const create = (seed = createDefaultNameNote(), isValid) => ({
  type: NAME_NOTE_ACTIONS.CREATE,
  payload: { nameNote: seed, isValid },
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

const saveNewSurvey = surveyData => (dispatch, getState) => {
  const nameNote = createDefaultNameNote();
  const nameId = selectEditingNameId(getState());
  const patientEvents = UIDatabase.objects('PCDEvents');

  if (patientEvents.length === 0) return;
  const [patientEvent] = patientEvents;

  nameNote.data = surveyData;
  nameNote.patientEventID = patientEvent.id;
  nameNote.nameID = nameId;

  dispatch({
    type: NAME_NOTE_ACTIONS.SAVE_NEW,
    payload: { nameNote },
  });
};

const saveEditing = () => (dispatch, getState) => {
  const currentNameNote = selectEditingNameNote(getState());
  const name = UIDatabase.get('Name', currentNameNote.nameID);
  const patientEvent = UIDatabase.get('PatientEvent', currentNameNote.patientEventID);

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
  update,
  updateNew,
  saveNew,
  saveEditing,
  saveNewSurvey,
  reset,
  createSurveyNameNote,
  updateForm,
};
