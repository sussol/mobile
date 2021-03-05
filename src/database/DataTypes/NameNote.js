import Realm from 'realm';
import Ajv from 'ajv';

const ajvOptions = {
  errorDataPath: 'property',
  allErrors: true,
  multipleOfPrecision: 8,
  schemaId: 'auto',
  unknownFormats: 'ignore',
  jsonPointers: true,
};
export class NameNote extends Realm.Object {
  get data() {
    try {
      return JSON.parse(this._data);
    } catch {
      // swallow error, return a default
      return null;
    }
  }

  // Will throw if newValue is unable to be stringified
  set data(newValue) {
    this._data = JSON.stringify(newValue);
  }

  get isValid() {
    const { jsonSchema } = this.formSchema ?? {};

    if (!jsonSchema) return false;

    const ajv = new Ajv(ajvOptions);
    const result = ajv.validate(jsonSchema, this.data);

    return result;
  }

  toObject() {
    return {
      id: this.id,
      entryDate: this.entryDate.getTime(),
      data: this.data,
      nameID: this.name.id,
      patientEventID: this.patientEvent.id,
      isValid: this.isValid,
    };
  }
}

NameNote.schema = {
  name: 'NameNote',
  primaryKey: 'id',
  properties: {
    id: 'string',
    entryDate: { type: 'date', default: new Date() },
    _data: { type: 'string', optional: true },
    name: 'Name',
    patientEvent: 'PatientEvent',
    formSchema: { type: 'FormSchema', optional: true },
  },
};

export default NameNote;
