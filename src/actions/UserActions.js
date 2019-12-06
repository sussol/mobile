/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const USER_ACTION_TYPES = {
  LOG_IN: 'USER/LOG_IN',
  LOG_OUT: 'USER/LOG_OUT',
};

export const UserActions = {
  login: user => ({ type: USER_ACTION_TYPES.LOG_IN, payload: { user } }),
  logout: () => ({ type: USER_ACTION_TYPES.LOG_OUT }),
};
