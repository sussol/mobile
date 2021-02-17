/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import moment from 'moment';
import { FRIDGE_DETAIL_ACTIONS } from '../actions/FridgeDetailActions';
import { ROUTES } from '../navigation';

const initialState = () => ({
  locationID: '',
  fromDate: moment(new Date()).subtract(30, 'd').startOf('day').valueOf(),
  toDate: moment(new Date()).endOf('day').valueOf(),
});

export const FridgeDetailReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case FRIDGE_DETAIL_ACTIONS.CHANGE_FROM_DATE: {
      const { payload } = action;
      const { date } = payload;

      const fromDate = new Date(date).getTime();

      return { ...state, fromDate };
    }

    case FRIDGE_DETAIL_ACTIONS.CHANGE_TO_DATE: {
      const { payload } = action;
      const { date } = payload;

      const toDate = new Date(date).getTime();

      return { ...state, toDate };
    }

    case 'Navigation/BACK':
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;
      const { locationID } = params ?? {};

      if (routeName === ROUTES.FRIDGE_DETAIL) {
        const newState = initialState();
        return { ...newState, locationID };
      }

      return state;
    }

    default:
      return state;
  }
};
