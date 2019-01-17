/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import {
  INCREMENT_SYNC_PROGRESS,
  SET_SYNC_PROGRESS,
  SET_SYNC_ERROR,
  SET_SYNC_TOTAL,
  SET_SYNC_MESSAGE,
  SET_SYNC_IS_SYNCING,
  SET_SYNC_COMPLETION_TIME,
} from './constants';

export const setSyncProgress = progress => ({
  type: SET_SYNC_PROGRESS,
  progress,
});

export const incrementSyncProgress = increment => ({
  type: INCREMENT_SYNC_PROGRESS,
  increment,
});

export const setSyncError = errorMessage => ({
  type: SET_SYNC_ERROR,
  errorMessage,
});

export const setSyncTotal = total => ({
  type: SET_SYNC_TOTAL,
  total,
});

export const setSyncProgressMessage = progressMessage => ({
  type: SET_SYNC_MESSAGE,
  progressMessage,
});

export const setSyncIsSyncing = isSyncing => ({
  type: SET_SYNC_IS_SYNCING,
  isSyncing,
});

export const setSyncCompletionTime = lastSyncTime => ({
  type: SET_SYNC_COMPLETION_TIME,
  lastSyncTime,
});
