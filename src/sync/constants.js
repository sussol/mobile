/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * List of app version -> server compatibilities.
 *
 * The key is the mobile major version.
 * The field is the lower bound inclusive major.minor version
 * of a compatible server.
 *
 * I.e. 4: 409 - Any mobile version 4 (or greater) requires at server
 * version of 4.09 or greater.
 */
export const SERVER_COMPATIBILITIES = {
  4: 409,
};

export const INCREMENT_SYNC_PROGRESS = 'INCREMENT_SYNC_PROGRESS';
export const SET_SYNC_ERROR = 'SET_SYNC_ERROR';
export const SET_SYNC_PROGRESS = 'SET_SYNC_PROGRESS';
export const SET_SYNC_TOTAL = 'SET_SYNC_TOTAL';
export const SET_SYNC_MESSAGE = 'SET_SYNC_MESSAGE';
export const SET_SYNC_IS_SYNCING = 'SET_SYNC_IS_SYNCING';
export const SET_SYNC_COMPLETION_TIME = 'SET_SYNC_COMPLETION_TIME';
export const SYNC_TRANSACTION_COMPLETE = 'SYNC_TRANSACTION_COMPLETE';

export const PROGRESS_LOADING = -1;
