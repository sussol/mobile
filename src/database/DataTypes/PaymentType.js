/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class PaymentType extends Realm.Object {}

PaymentType.schema = {
  name: 'PaymentType',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: { type: 'string', default: 'PlaceholderCode' },
    description: { type: 'string', default: 'PlaceholderDescription' },
  },
};

export default PaymentType;
