import Realm from 'realm';

export class FormSchema extends Realm.Object {
  get jsonSchema() {
    try {
      return JSON.parse(this._jsonSchema);
    } catch {
      // swallow error and return null by default
      return null;
    }
  }

  get uiSchema() {
    try {
      return JSON.parse(this._uiSchema);
    } catch {
      // swallow error and return null by default
      return null;
    }
  }
}

FormSchema.schema = {
  name: 'FormSchema',
  primaryKey: 'id',
  properties: {
    id: 'string',
    _jsonSchema: { type: 'string' },
    _uiSchema: { type: 'string' },
    type: { type: 'string' },
    version: { type: 'int' },
  },
};
