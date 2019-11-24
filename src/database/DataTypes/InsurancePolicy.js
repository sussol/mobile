import Realm from 'realm';

export class InsurancePolicy extends Realm.Object {}

InsurancePolicy.schema = {
  name: 'InsurancePolicy',
  primaryKey: 'id',
  properties: {
    id: 'string',
    patient: 'string',
    policyNumberFamily: 'string',
    policyNumberPerson: 'string',
    type: 'string',
    discountRate: 'float',
    expiryDate: 'date',
    enteredBy: { type: 'User', optional: false },
    insuranceProvider: { type: 'InsuranceProvider', optional: false },
  },
};

export default InsurancePolicy;
