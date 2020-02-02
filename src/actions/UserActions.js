/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import moment from 'moment';

export const USER_ACTION_TYPES = {
  LOG_IN: 'USER/LOG_IN',
  LOG_OUT: 'USER/LOG_OUT',
  SET_TIME: 'USER/SET_TIME',
  ACTIVE: 'USER/ACTIVE',
};

const login = user => ({ type: USER_ACTION_TYPES.LOG_IN, payload: { user } });
const logout = () => ({ type: USER_ACTION_TYPES.LOG_OUT });
const setTime = () => ({ type: USER_ACTION_TYPES.SET_TIME });

const active = () => (dispatch, getState) => {
  const { user } = getState();
  const { time } = user;

  const threeMinutesLater = moment(time).add(3, 'minutes');
  const timeNow = moment();

  if (threeMinutesLater.isBefore(timeNow)) return dispatch(logout());
  return dispatch(setTime());
};

export const UserActions = {
  login,
  logout,
  setTime,
  active,
};
