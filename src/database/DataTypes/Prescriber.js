import Realm from 'realm';

export class Prescriber extends Realm.Object {}

Prescriber.schema = {
  name: 'Prescriber',
  primaryKey: 'id',
  properties: {
    id: 'string',
    firstName: { type: 'string', default: 'placeholderName' },
    lastName: { type: 'string', default: 'placeholderName' },
    registrationCode: { type: 'string', default: 'placeholderCode' },
    address: { type: 'Address', optional: true },
    isVisible: { type: 'bool', default: false },
    isActive: { type: 'bool', default: false },
    phoneNumber: { type: 'string', optional: true },
    mobileNumber: { type: 'string', optional: true },
    emailAddress: { type: 'string', optional: true },
    transactions: { type: 'linkingObjects', objectType: 'Transaction', property: 'prescriber' },
    fromThisStore: { type: 'bool', default: false },
    female: { type: 'bool', default: false },
  },
};

export default Prescriber;
