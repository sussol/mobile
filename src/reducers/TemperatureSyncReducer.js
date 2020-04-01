/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { TEMPERATURE_SYNC_ACTIONS } from '../actions/TemperatureSyncActions';

const TEMPERATURE_SYNC_STATES = {
  SCANNING: 'SCANNING',
  SCAN_ERROR: 'SCAN_ERROR',
  DOWNLOADING_LOGS: 'DOWNLOADING_LOGS',
  DOWNLOADING_LOGS_ERROR: 'DOWNLOADING_LOGS_ERROR',
  RESETTING_ADVERTISEMENT_FREQUENCY: 'RESETTING_ADVERTISEMENT_FREQUENCY',
  RESETTING_LOG_FREQUENCY: 'RESETTING_LOG_FREQUENCY',
  ERROR_RESETTING_ADVERTISEMENT_FREQUENCY: 'ERROR_RESETTING_ADVERTISEMENT_FREQUENCY',
  ERROR_RESETTING_LOG_FREQUENCY: 'ERROR_RESETTING_LOG_FREQUENCY',
  SAVING_LOGS: 'SAVING_LOGS',
  NO_SENSORS: 'NO_SENSORS',
  SYNCING: 'SYNCING',
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
    case TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.DOWNLOADING_LOGS };
    }
    case TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_ERROR: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.DOWNLOADING_LOGS_ERROR };
    }
    case TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.START_RESETTING_LOG_FREQUENCY: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.RESETTING_LOG_FREQUENCY };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_RESETTING_LOG_FREQUENCY: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.ERROR_RESETTING_LOG_FREQUENCY: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.ERROR_RESETTING_LOG_FREQUENCY };
    }
    case TEMPERATURE_SYNC_ACTIONS.START_RESETTING_ADVERTISEMENT_FREQUENCY: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.RESETTING_ADVERTISEMENT_FREQUENCY };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_RESETTING_ADVERTISEMENT_FREQUENCY: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.ERROR_RESETTING_ADVERTISEMENT_FREQUENCY: {
      return {
        ...state,
        syncState: TEMPERATURE_SYNC_STATES.ERROR_RESETTING_LOG_FREQUENCY,
      };
    }
    case TEMPERATURE_SYNC_ACTIONS.START_SAVING_TEMPERATURE_LOGS: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SAVING_LOGS };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_SAVING_TEMPERATURE_LOGS: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.ERROR_NO_SENSORS: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.NO_SENSORS };
    }
    case TEMPERATURE_SYNC_ACTIONS.START_SYNC: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SYNCING };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_SYNC: {
      return { ...state, syncState: null };
    }
    default:
      return state;
  }
};
