import Realm from 'realm';

export class InsurancePolicy extends Realm.Object {
  get policyNumber() {
    if (!this.policyNumberPerson) return this.policyNumberFamily;
    return `${this.policyNumberFamily}-${this.policyNumberPerson}`;
  }
}

InsurancePolicy.schema = {
  name: 'InsurancePolicy',
  primaryKey: 'id',
  properties: {
    id: 'string',
    policyNumberFamily: 'string',
    policyNumberPerson: { type: 'string', default: '' },
    type: 'string',
    discountRate: 'double',
    isActive: { type: 'bool', default: true },
    expiryDate: 'date',
    enteredBy: { type: 'User', optional: true },
    patient: { type: 'Name', optional: false },
    insuranceProvider: { type: 'InsuranceProvider', optional: false },
  },
};

export default InsurancePolicy;
