import Ajv from 'ajv';
import { generateUUID } from 'react-native-database';
import { createRecord, UIDatabase } from '../../database/index';
import { selectCreatingNameNote } from '../../selectors/Entities/nameNote';
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
  SELECT: 'NAME_NOTE/select',
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
    data: {},
    patientEventID: pcd?.id ?? '',
    nameID,
  };
};

// YES
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

const updateForm = (data, errors) => ({
  type: NAME_NOTE_ACTIONS.UPDATE_DATA,
  payload: { data, errors },
});

const saveEditing = () => (dispatch, getState) => {
  const { nameID, patientEventID, ...nameNote } = selectCreatingNameNote(getState()) ?? {};
  UIDatabase.write(() => createRecord(UIDatabase, 'NameNote', nameNote, patientEventID, nameID));
  dispatch(reset());
};

const reset = () => ({
  type: NAME_NOTE_ACTIONS.RESET,
});

export const NameNoteActions = {
  reset,
  createSurveyNameNote,
  updateForm,
  saveEditing,
};
