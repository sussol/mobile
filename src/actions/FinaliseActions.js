/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { Client as BugsnagClient } from 'bugsnag-react-native';

import { UIDatabase } from '../database';
import { RootNavigator } from '../navigation';
import { selectCurrentUser } from '../selectors/user';

import { selectFinaliseItem } from '../selectors/finalise';
import { refreshData } from '../pages/dataTableUtilities/actions/tableActions';

const bugsnagClient = new BugsnagClient();

export const FINALISE_ACTIONS = {
  OPEN_MODAL: 'Finalise/openModal',
  CLOSE_MODAL: 'Finalise/closeModal',
  RESET_FINALISE_ITEM: 'Finalise/resetFinaliseItem',
  SET_FINALISE_ITEM: 'Finalise/setFinaliseItem',
};

const openModal = () => ({ type: FINALISE_ACTIONS.OPEN_MODAL });
const closeModal = () => ({ type: FINALISE_ACTIONS.CLOSE_MODAL });
const resetFinaliseItem = () => ({ type: FINALISE_ACTIONS.RESET_FINALISE_ITEM });
const setFinaliseItem = finaliseItem => ({
  type: FINALISE_ACTIONS.SET_FINALISE_ITEM,
  payload: { finaliseItem },
});

const finalise = () => (dispatch, getState) => {
  const finaliseItem = selectFinaliseItem(getState());
  const currentUser = selectCurrentUser(getState());
  const currentRoute = RootNavigator.getCurrentRouteName();

  try {
    UIDatabase.write(() => finaliseItem.finalise(UIDatabase, currentUser));
  } catch (error) {
    bugsnagClient.notify(error);
  }

  dispatch(refreshData(currentRoute));
};

export const FinaliseActions = {
  openModal,
  closeModal,
  resetFinaliseItem,
  setFinaliseItem,
  finalise,
};
