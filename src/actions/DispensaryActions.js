/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';
import { selectUsingAdverseDrugReactions } from '../selectors/modules';

import { FORM_ACTIONS } from './FormActions';

export const DISPENSARY_ACTIONS = {
  FILTER: 'Dispensary/filter',
  SORT: 'Dispensary/sort',
  SWITCH: 'Dispensary/switch',
  REFRESH: 'Dispensary/refresh',
  OPEN_LOOKUP_MODAL: 'Dispensary/openLookupModal',
  CLOSE_LOOKUP_MODAL: 'Dispensary/closeLookupModal',
};

const filter = searchTerm => ({ type: DISPENSARY_ACTIONS.FILTER, payload: { searchTerm } });

const sort = sortKey => ({ type: DISPENSARY_ACTIONS.SORT, payload: { sortKey } });

const switchDataSet = () => (dispatch, getState) =>
  dispatch({
    type: DISPENSARY_ACTIONS.SWITCH,
    payload: { usingAdverseDrugReactions: selectUsingAdverseDrugReactions(getState()) },
  });

const refresh = () => ({ type: DISPENSARY_ACTIONS.REFRESH });

const openLookupModal = () => ({ type: DISPENSARY_ACTIONS.OPEN_LOOKUP_MODAL });

const closeLookupModal = () => dispatch => {
  batch(() => {
    dispatch({ type: DISPENSARY_ACTIONS.CLOSE_LOOKUP_MODAL });
    dispatch({ type: FORM_ACTIONS.CANCEL });
  });
};

export const DispensaryActions = {
  filter,
  sort,
  switchDataSet,
  refresh,
  openLookupModal,
  closeLookupModal,
};
