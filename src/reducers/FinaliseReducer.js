/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { FINALISE_ACTIONS } from '../actions/FinaliseActions';

/**
 * Simple reducer managing the stores current finalise state.
 *
 * State shape:
 * {
 *     finaliseModalOpen: [bool]
 * }
 */

const initialState = () => ({ finaliseModalOpen: false });

export const FinaliseReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case FINALISE_ACTIONS.OPEN_MODAL: {
      return { ...state, finaliseModalOpen: true };
    }
    case FINALISE_ACTIONS.CLOSE_MODAL: {
      return { ...state, finaliseModalOpen: false };
    }
    default:
      return state;
  }
};
