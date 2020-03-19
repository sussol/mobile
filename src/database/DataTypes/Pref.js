import Realm from 'realm';

export class Pref extends Realm.Object {}

Pref.schema = {
  name: 'Pref',
  primaryKey: 'id',
  properties: {
    id: 'string',
    data: { type: 'string', default: '' },
  },
};

export default Pref;
