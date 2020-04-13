/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A user.
 *
 * @property  {String}  id
 * @property  {String}  username
 * @property  {Date}    lastLogin
 * @property  {String}  firstName
 * @property  {String}  lastName
 * @property  {String}  email
 * @property  {String}  passwordHash
 * @property  {String}  salt
 * @property  {Object}  permissions
 */
export class User extends Realm.Object {
  /* eslint-disable class-methods-use-this */
  get defaultPermissions() {
    return {
      isAdmin: false,
      showStocktakeCurrentQuantity: true,
    };
  }

  get permissions() {
    const permissions = JSON.parse(this._permissions);
    return { ...this.defaultPermissions, ...permissions };
  }

  get isAdmin() {
    return this.permissions.isAdmin;
  }

  get showStocktakeCurrentQuantity() {
    return this.permissions.showStocktakeCurrentQuantity;
  }

  set permissions(permissions) {
    this._permissions = JSON.stringify(permissions);
  }

  set isAdmin(isAdmin) {
    this.permissions = { ...this.permissions, isAdmin };
  }

  set showStocktakeCurrentQuantity(showStocktakeCurrentQuantity) {
    this.permissions = { ...this.permissions, showStocktakeCurrentQuantity };
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
    _permissions: { type: 'string', default: '{}' },
  },
};

export default User;
