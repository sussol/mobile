/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { TEMPERATURE_SYNC_ACTIONS } from '../actions/TemperatureSyncActions';

const TEMPERATURE_SYNC_STATES = {
  SCANNING: 'SCANNING',
  SCAN_ERROR: 'SCAN_ERROR',
};

const initialState = () => ({
  progress: 0,
  total: 0,
  syncState: null,
  isSyncing: false,
});

export const TemperatureSyncReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case TEMPERATURE_SYNC_ACTIONS.START_SCAN: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SCANNING };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_SCAN: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.SCAN_ERROR: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SCAN_ERROR };
    }

    default:
      return state;
  }
};
