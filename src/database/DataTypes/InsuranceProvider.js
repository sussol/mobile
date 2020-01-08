import Realm from 'realm';

export class InsuranceProvider extends Realm.Object {}

InsuranceProvider.schema = {
  name: 'InsuranceProvider',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', optional: true },
    comment: { type: 'string', optional: true },
    validityDays: { type: 'int', optional: true },
    isActive: { type: 'bool', optional: true },
    policies: {
      type: 'linkingObjects',
      objectType: 'InsurancePolicy',
      property: 'insuranceProvider',
    },
  },
};

export default InsuranceProvider;
