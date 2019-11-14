/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { SYNC_TRANSACTION_COMPLETE } from '../sync/constants';

/**
 * Simple reducer managing the stores current modules state.
 *
 * State shape:
 * {
 *     usingDispensary: [bool],
 *     usingVaccines: [bool],
 *     usingModules: [bool],
 * }
 */

const checkModule = key => UIDatabase.getSetting(key).toLowerCase() === 'true';

const modulesInitialState = () => {
  const usingDispensary = checkModule(SETTINGS_KEYS.DISPENSARY_MODULE);
  const usingVaccines = checkModule(SETTINGS_KEYS.VACCINE_MODULE);
  const usingModules = usingDispensary || usingVaccines;

  return { usingDispensary, usingVaccines, usingModules };
};

export const ModulesReducer = (state = modulesInitialState(), action) => {
  const { type } = action;

  switch (type) {
    // After sync, refresh modules state
    case SYNC_TRANSACTION_COMPLETE: {
      return modulesInitialState();
    }

    default:
      return state;
  }
};
