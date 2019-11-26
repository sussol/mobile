import Realm from 'realm';

export class InsurancePolicy extends Realm.Object {
  get policyNumber() {
    return `${this.policyNumberPerson} ${this.policyNumberFamily}`;
  }
}

InsurancePolicy.schema = {
  name: 'InsurancePolicy',
  primaryKey: 'id',
  properties: {
    id: 'string',
    policyNumberFamily: 'string',
    policyNumberPerson: 'string',
    type: 'string',
    discountRate: 'float',
    expiryDate: 'date',
    enteredBy: { type: 'User', optional: true },
    patient: { type: 'Name', optional: false },
    insuranceProvider: { type: 'InsuranceProvider', optional: false },
  },
};

export default InsurancePolicy;
