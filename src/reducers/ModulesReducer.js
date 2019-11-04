/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';

/**
 * Reducer for Modules field in redux with the shape:
 * {
 *     usingDispensary: [bool]
 * }
 */

const modulesInitialState = () => {
  const thisStoreCustomData = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_CUSTOM_DATA);

  try {
    const parsedCustomData = JSON.parse(thisStoreCustomData);
    return { usingDispensary: parsedCustomData.usingDispensary.data === 'true' };
  } catch (error) {
    return { usingDispensary: false };
  }
};

export const ModulesReducer = (state = modulesInitialState()) => state;
