import Realm from 'realm';

export class AdverseDrugReaction extends Realm.Object {
  get data() {
    try {
      return JSON.parse(this._data);
    } catch {
      // swallow error and return null by default
      return null;
    }
  }

  set data(newData) {
    try {
      this._data = JSON.stringify(newData);
    } catch (e) {
      this._data = '';
    }
  }
}

AdverseDrugReaction.schema = {
  name: 'AdverseDrugReaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    _data: { type: 'string', optional: true },
    name: { type: 'Name', optional: true },
    formSchema: { type: 'FormSchema', optional: true },
    user: { type: 'User', optional: true },
    entryDate: { type: 'date', optional: true },
  },
};
