/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { SYNC_TRANSACTION_COMPLETE } from '../sync/constants';

/**
 * Simple reducer managing the stores current modules state.
 */

const checkModule = key => UIDatabase.getSetting(key).toLowerCase() === 'true';

const initialState = () => {
  const usingDashboard = checkModule(SETTINGS_KEYS.DASHBOARD_MODULE);
  const usingDispensary = checkModule(SETTINGS_KEYS.DISPENSARY_MODULE);
  const usingVaccines = checkModule(SETTINGS_KEYS.VACCINE_MODULE);
  const usingPayments = checkModule(SETTINGS_KEYS.PAYMENT_MODULE);
  const usingModules = usingDashboard || usingDispensary || usingVaccines || usingPayments;
  const usingInsurance = UIDatabase.objects('InsuranceProvider').length > 0;

  return {
    usingPayments,
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingModules,
    usingInsurance,
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
