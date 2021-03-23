/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import moment from 'moment';
import { UIDatabase } from '../database/index';
import { SETTINGS_KEYS } from '../settings/index';

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
  const idleLogoutInterval = Number(UIDatabase.getSetting(SETTINGS_KEYS.IDLE_LOGOUT_INTERVAL));
  const timeNowWithLogoutOffset = moment(time).add(idleLogoutInterval, 'milliseconds');

  const timeNow = moment();

  if (timeNowWithLogoutOffset.isBefore(timeNow)) return dispatch(logout());
  return dispatch(setTime());
};

export const UserActions = {
  login,
  logout,
  setTime,
  active,
};
