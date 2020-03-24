import Realm from 'realm';

import { PREFERENCE_TYPES } from '../utilities/constants';

export class Preference extends Realm.Object {
  get type() {
    return PREFERENCE_TYPES[this.id];
  }
}

Preference.schema = {
  name: 'Preference',
  primaryKey: 'id',
  properties: {
    id: 'string',
    data: { type: 'string', default: '' },
  },
};

export default Preference;
