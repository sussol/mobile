/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { batch } from 'react-redux';
import { Client as BugsnagClient } from 'bugsnag-react-native';

import { UIDatabase } from '../database';
import { selectCurrentUser } from '../selectors/user';

import { selectFinaliseItem } from '../selectors/finalise';

const bugsnagClient = new BugsnagClient();

export const FINALISE_ACTIONS = {
  OPEN_MODAL: 'Finalise/openModal',
  CLOSE_MODAL: 'Finalise/closeModal',
  CONFIRM_FINALISE: 'Finalise/confirmFinalise',
  SET_FINALISE_ITEM: 'Finalise/setFinaliseItem',
};

const openModal = () => ({ type: FINALISE_ACTIONS.OPEN_MODAL });
const closeModal = () => ({ type: FINALISE_ACTIONS.CLOSE_MODAL });
const confirmFinalise = () => ({ type: FINALISE_ACTIONS.CONFIRM_FINALISE });
const setFinaliseItem = finaliseItem => ({
  type: FINALISE_ACTIONS.SET_FINALISE_ITEM,
  payload: { finaliseItem },
});

const finalise = () => (dispatch, getState) => {
  const finaliseItem = selectFinaliseItem(getState());
  const currentUser = selectCurrentUser(getState());

  try {
    UIDatabase.write(() => finaliseItem.finalise(UIDatabase, currentUser));
  } catch (error) {
    bugsnagClient.notify(error);
  }

  batch(() => {
    dispatch(closeModal());
    dispatch(confirmFinalise());
  });
};

export const FinaliseActions = { openModal, closeModal, setFinaliseItem, finalise };
