/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class NameNote extends Realm.Object {
  get data() {
    try {
      const { value } = JSON.parse(this._value);
      return value;
    } catch {
      // swallow error, return a default
      return null;
    }
  }

  // Will throw if newValue is unable to be stringified
  set data(newValue) {
    this._value = JSON.stringify({ value: newValue });
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
  },
};

export default NameNote;
