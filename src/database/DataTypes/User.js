import Realm from 'realm';

export class User extends Realm.Object {
  toString() {
    return this.name;
  }
}

User.schema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'string',
    username: { type: 'string', default: 'placeholderUsername' },
    lastLogin: { type: 'date', optional: true },
    firstName: { type: 'string', optional: true },
    lastName: { type: 'string', optional: true },
    email: { type: 'string', optional: true },
    passwordHash: {
      type: 'string',
      default: '4ada0b60df8fe299b8a412bbc8c97d0cb204b80e5693608ab2fb09ecde6d252d',
    },
    salt: { type: 'string', optional: true },
  },
};
