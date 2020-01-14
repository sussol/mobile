/* eslint-disable no-underscore-dangle */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class Message extends Realm.Object {
  get body() {
    return JSON.parse(this._body);
  }

  set body(newBodyObject) {
    this._body = JSON.stringify(newBodyObject);
  }
}

Message.schema = {
  name: 'Message',
  primaryKey: 'id',
  properties: {
    id: 'string',
    _body: 'string?',
    createdDate: { type: 'date', default: new Date() },
    status: { type: 'string', default: 'new' },
    type: 'string?',
  },
};

export default Message;
