/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { STORE_PREF_KEYS } from '../settings';
import { SYNC_TRANSACTION_COMPLETE } from '../sync/constants';

/**
 * Simple reducer managing the stores current modules state.
 *
 * State shape:
 * {
 *     usingDashboard: [bool],
 *     usingDispensary: [bool],
 *     usingVaccines: [bool],
 *     usingCashRegister: [bool],
 *     usingPayments: [bool],
 *     usingSupplierCredits: [bool],
 *     usingModules: [bool],
 *     usingInsurance: [bool],
 *     usingHideSnapshotColumn: [bool],
 * }
 */

const checkModule = key => {
  const value = UIDatabase.getPreference(key) ?? UIDatabase.getSetting(key);
  try {
    const usingModule = JSON.parse(value.toLowerCase());
    return usingModule;
  } catch (error) {
    return false;
  }
};

const initialState = () => {
  const usingInsurance = UIDatabase.objects('InsuranceProvider').length > 0;
  const usingPaymentTypes = UIDatabase.objects('PaymentType').length > 0;
  const usingPrescriptionCategories = UIDatabase.objects('PrescriptionCategory').length > 0;
  const usingSupplierCreditCategories = UIDatabase.objects('SupplierCreditCategory').length > 0;

  const usingDashboard = checkModule(STORE_PREF_KEYS.DASHBOARD_MODULE);
  const usingDispensary = checkModule(STORE_PREF_KEYS.DISPENSARY_MODULE);
  const usingVaccines = checkModule(STORE_PREF_KEYS.VACCINE_MODULE);
  const usingCashRegister = checkModule(STORE_PREF_KEYS.CASH_REGISTER_MODULE) && usingPaymentTypes;
  const usingPayments = checkModule(STORE_PREF_KEYS.PAYMENT_MODULE);
  const usingPatientTypes = checkModule(STORE_PREF_KEYS.PATIENT_TYPES);
  const usingHideSnapshotColumn = checkModule(STORE_PREF_KEYS.HIDE_SNAPSHOT_COLUMN);

  const usingModules = usingDashboard || usingDispensary || usingVaccines || usingCashRegister;

  return {
    usingPayments,
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
    usingInsurance,
    usingPrescriptionCategories,
    usingSupplierCreditCategories,
    usingPaymentTypes,
    usingPatientTypes,
    usingHideSnapshotColumn,
  };
};

export const ModulesReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    // After sync, refresh modules state
    case SYNC_TRANSACTION_COMPLETE: {
      return initialState();
    }

    default:
      return state;
  }
};
