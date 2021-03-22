import Ajv from 'ajv';
import { generateUUID } from 'react-native-database';
import moment from 'moment';
import { createRecord, UIDatabase } from '../../database/index';
import { selectCreatingNameNote } from '../../selectors/Entities/nameNote';
import { selectSurveySchemas } from '../../selectors/formSchema';

const ajvErrors = require('ajv-errors');

const ajvOptions = {
  errorDataPath: 'property',
  allErrors: true,
  multipleOfPrecision: 8,
  schemaId: 'auto',
  jsonPointers: true,
};

export const NAME_NOTE_ACTIONS = {
  SELECT: 'NAME_NOTE/select',
  RESET: 'NAME_NOTE/reset',
  UPDATE_DATA: 'NAME_NOTE/updateData',
  CREATE: 'NAME_NOTE/create',
};

const ajv = new Ajv(ajvOptions);
ajvErrors(ajv);

const validateData = (jsonSchema, data) => {
  if (!jsonSchema) return true;

  const result = ajv.validate(jsonSchema, data);

  return result;
};

const createDefaultNameNote = (nameID = '') => {
  const [pcd] = UIDatabase.objects('PCDEvents');

  return {
    id: generateUUID(),
    entryDate: new Date(),
    data: {},
    patientEventID: pcd?.id ?? '',
    nameID,
  };
};

const getMostRecentPCD = patient => {
  const [pcdEvent] = UIDatabase.objects('PCDEvents');
  if (!pcdEvent) return null;

  const { id: pcdEventID } = pcdEvent;
  const { nameNotes = [] } = patient ?? {};

  if (!nameNotes.length) return null;

  const filtered = nameNotes.filter(({ patientEventID }) => patientEventID === pcdEventID);
  if (!filtered.length) return null;

  const sorted = filtered.sort(
    ({ entryDate: entryDateA }, { entryDate: entryDateB }) =>
      moment(entryDateB).valueOf() - moment(entryDateA).valueOf()
  );
  const [mostRecentPCD] = sorted;
  return mostRecentPCD;
};

const createSurveyNameNote = patient => (dispatch, getState) => {
  // Create the seed PCD, which is either their most recently filled survey or
  // and empty object.

  const seedPCD = getMostRecentPCD(patient) ?? createDefaultNameNote(patient.id);

  // Get the survey schema as we need an initial validation to determine if
  // the seed has any fields which are required to be filled.
  const [surveySchema = {}] = selectSurveySchemas(getState);
  const { jsonSchema } = surveySchema;
  const isValid = validateData(jsonSchema, seedPCD.data);

  if (seedPCD.toObject) {
    // Only create name notes, never edit- ensure every new name note which is seeded has a new ID.
    const id = generateUUID();
    const asObject = { ...seedPCD.toObject(), id, entryDate: new Date().getTime() };
    dispatch(select(asObject, isValid));
  } else {
    dispatch(select(seedPCD, isValid));
  }
};

const select = (seed = createDefaultNameNote(), isValid) => ({
  type: NAME_NOTE_ACTIONS.SELECT,
  payload: { nameNote: seed, isValid },
});

const updateForm = (data, validator) => ({
  type: NAME_NOTE_ACTIONS.UPDATE_DATA,
  payload: { data, isValid: validator(data) },
});

const saveEditing = optionalNameID => (dispatch, getState) => {
  const { nameID, patientEventID, ...nameNote } = selectCreatingNameNote(getState()) ?? {};

  UIDatabase.write(() =>
    createRecord(UIDatabase, 'NameNote', nameNote, patientEventID, nameID || optionalNameID)
  );
  dispatch(reset());
};

const createNotes = (nameNotes = []) => {
  UIDatabase.write(() => {
    nameNotes.forEach(nameNote => {
      UIDatabase.update('NameNote', nameNote);
    });
  });

  return { type: NAME_NOTE_ACTIONS.CREATE };
};

const reset = () => ({
  type: NAME_NOTE_ACTIONS.RESET,
});

export const NameNoteActions = {
  createNotes,
  reset,
  createSurveyNameNote,
  updateForm,
  saveEditing,
};
