/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import moment from 'moment';

import { UIDatabase } from '../database';
import { FRIDGE_ACTIONS } from '../actions/FridgeActions';

const initialState = () => {
  const fridges = UIDatabase.objects('Fridge');

  return {
    fridges,
    selectedFridge: fridges[0],
    fromDate: moment(new Date())
      .subtract(30, 'd')
      .toDate(),
    toDate: new Date(),
  };
};

export const FridgeReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case FRIDGE_ACTIONS.SELECT: {
      const { payload } = action;
      const { fridge } = payload;

      return { ...state, selectedFridge: fridge };
    }
    default:
      return state;
  }
};
