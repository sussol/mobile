/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import {
  INCREMENT_SYNC_PROGRESS,
  SET_SYNC_ERROR,
  SET_SYNC_PROGRESS,
  SET_SYNC_TOTAL,
  SET_SYNC_MESSAGE,
  SET_SYNC_COMPLETION_TIME,
  SET_SYNC_IS_SYNCING,
  OPEN_SYNC_MODAL,
  CLOSE_SYNC_MODAL,
} from '../sync/constants';
import { createReducer, REHYDRATE } from '../utilities';

const defaultState = {
  progressMessage: '',
  errorMessage: '',
  total: 0,
  progress: 0,
  isSyncing: false,
  lastSyncTime: 0,
  syncModalIsOpen: false,
};

const stateChanges = {
  [INCREMENT_SYNC_PROGRESS]: ({ increment }, { progress }) => ({
    progress: progress + increment,
  }),
  [SET_SYNC_MESSAGE]: ({ progressMessage }) => ({
    progressMessage,
    errorMessage: '',
  }),
  [SET_SYNC_PROGRESS]: ({ progress }) => ({
    progress,
    errorMessage: '',
  }),
  [SET_SYNC_ERROR]: ({ errorMessage }) => ({
    errorMessage,
    progressMessage: '',
  }),
  [SET_SYNC_TOTAL]: ({ total }) => ({
    total,
    errorMesssage: '',
  }),
  [SET_SYNC_IS_SYNCING]: ({ isSyncing }) => ({
    isSyncing,
  }),
  [SET_SYNC_COMPLETION_TIME]: ({ lastSyncTime }) => ({
    lastSyncTime,
  }),
  [OPEN_SYNC_MODAL]: () => {
    console.log('??');
    return { syncModalIsOpen: true };
  },
  [CLOSE_SYNC_MODAL]: () => ({
    syncModalIsOpen: false,
  }),
  [REHYDRATE]: ({ sync: persistedSyncState = defaultState }) => {
    // Keep any error message and last sync time persistent across sessions.
    const { errorMessage, lastSyncTime } = persistedSyncState;
    return {
      errorMessage,
      lastSyncTime,
    };
  },
};

const SyncReducer = createReducer(defaultState, stateChanges);

export default SyncReducer;
