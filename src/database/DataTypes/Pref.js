import Realm from 'realm';

export const PREF_KEYS = {
  CONSUMPTION_LOOKBACK_PERIOD: 'monthlyConsumptionLookBackPeriod',
  CONSUMPTION_ENFORCE_LOOKBACK: 'monthlyConsumptionEnforceLookBackPeriod',
  MONTHS_LEAD_TIME: 'monthsLeadTime',
  VACCINE_MODULE: 'usesVaccineModule',
  DISPENSARY_MODULE: 'usesDispensaryModule',
  DASHBOARD_MODULE: 'usesDashboardModule',
  CASH_REGISTER_MODULE: 'usesCashRegisterModule',
  PAYMENT_MODULE: 'usesPaymentModule',
  PATIENT_TYPES: 'usesPatientTypes',
  HIDE_SNAPSHOT_COLUMN: 'usesHideSnapshotColumn',
};

const TYPES = {
  NUMERIC: 'numeric',
  BOOL: 'bool',
};

export const PREF_TYPES = {
  [PREF_KEYS.CONSUMPTION_LOOKBACK_PERIOD]: TYPES.NUMERIC,
  [PREF_KEYS.CONSUMPTION_ENFORCE_LOOKBACK]: TYPES.BOOL,
  [PREF_KEYS.MONTHS_LEAD_TIME]: TYPES.NUMERIC,
  [PREF_KEYS.VACCINE_MODULE]: TYPES.BOOL,
  [PREF_KEYS.DISPENSARY_MODULE]: TYPES.BOOL,
  [PREF_KEYS.DASHBOARD_MODULE]: TYPES.BOOL,
  [PREF_KEYS.CASH_REGISTER_MODULE]: TYPES.BOOL,
  [PREF_KEYS.PAYMENT_MODULE]: TYPES.BOOL,
  [PREF_KEYS.PATIENT_TYPES]: TYPES.BOOL,
  [PREF_KEYS.HIDE_SNAPSHOT_COLUMN]: TYPES.BOOL,
};

export class Pref extends Realm.Object {
  get type() {
    return PREF_TYPES[this.id];
  }

  get value() {
    switch (this.type) {
      case TYPES.BOOL:
        try {
          return !!JSON.parse(this.data);
        } catch (error) {
          return false;
        }
      case TYPES.NUMERIC:
        try {
          return JSON.parse(this.data);
        } catch (error) {
          return 0;
        }
      default:
        try {
          return JSON.parse(this.data);
        } catch (error) {
          return '';
        }
    }
  }
}

Pref.schema = {
  name: 'Pref',
  primaryKey: 'id',
  properties: {
    id: 'string',
    data: { type: 'string', default: '' },
  },
};

export default Pref;
