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

export const TYPE_KEYS = {
  NUMERIC: 'numeric',
  NON_NEGATIVE_NUMERIC: 'non_negative_numeric',
  BOOL: 'bool',
};

export const PREF_TYPES = {
  [PREF_KEYS.CONSUMPTION_LOOKBACK_PERIOD]: TYPE_KEYS.NON_NEGATIVE_NUMERIC,
  [PREF_KEYS.CONSUMPTION_ENFORCE_LOOKBACK]: TYPE_KEYS.BOOL,
  [PREF_KEYS.MONTHS_LEAD_TIME]: TYPE_KEYS.NON_NEGATIVE_NUMERIC,
  [PREF_KEYS.VACCINE_MODULE]: TYPE_KEYS.BOOL,
  [PREF_KEYS.DISPENSARY_MODULE]: TYPE_KEYS.BOOL,
  [PREF_KEYS.DASHBOARD_MODULE]: TYPE_KEYS.BOOL,
  [PREF_KEYS.CASH_REGISTER_MODULE]: TYPE_KEYS.BOOL,
  [PREF_KEYS.PAYMENT_MODULE]: TYPE_KEYS.BOOL,
  [PREF_KEYS.PATIENT_TYPES]: TYPE_KEYS.BOOL,
  [PREF_KEYS.HIDE_SNAPSHOT_COLUMN]: TYPE_KEYS.BOOL,
};

export class Preference extends Realm.Object {
  get type() {
    return PREF_TYPES[this.id];
  }
}

Preference.schema = {
  name: 'Preference',
  primaryKey: 'id',
  properties: {
    id: 'string',
    data: { type: 'string', default: '' },
  },
};

export default Preference;
