/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { SYNC_TRANSACTION_COMPLETE } from '../sync/constants';

/**
 * Simple reducer managing the stores current modules state.
<<<<<<< HEAD
 *
 * State shape:
 * {
 *     usingDashboard: [bool],
 *     usingDispensary: [bool],
 *     usingVaccines: [bool],
 *     usingCashRegister: [bool],
 *     usingModules: [bool],
 * }
=======
>>>>>>> #feature-dispensary
 */

const checkModule = key => UIDatabase.getSetting(key).toLowerCase() === 'true';

const initialState = () => {
  const usingDashboard = checkModule(SETTINGS_KEYS.DASHBOARD_MODULE);
  const usingDispensary = checkModule(SETTINGS_KEYS.DISPENSARY_MODULE);
  const usingVaccines = checkModule(SETTINGS_KEYS.VACCINE_MODULE);
  const usingCashRegister = checkModule(SETTINGS_KEYS.CASH_REGISTER_MODULE);
  const usingPayments = checkModule(SETTINGS_KEYS.PAYMENT_MODULE);
  const usingSupplierCredits = checkModule(SETTINGS_KEYS.SUPPLIER_CREDIT_MODULE);

  const usingModules = usingDashboard || usingDispensary || usingVaccines || usingCashRegister || usingPayments || usingSupplierCredits;
  
  const usingInsurance = UIDatabase.objects('InsuranceProvider').length > 0;

  return {
    usingPayments,
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
    usingInsurance,
    usingSupplierCredits,
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
