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

  // Saving the time 'now' in state gives a reference to when the page was first navigated to
  // which can be used to change the `toDate` back to 'this' moment in time. For example,
  // if a user is to navigate to the fridge detail page and change the `toDate` to any day before
  // 'now', then the user won't be able to re-select 'now' in the date picker unless there is a
  // temperature log on this day, unless we re-calculate the date 'now' each time, which will cause
  // the reference to 'now' to be unstable, causing un-needed re-renders.
  now: moment().valueOf(),
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

    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;
      const { locationID } = params ?? {};

      if (routeName === ROUTES.FRIDGE_DETAIL) {
        const newState = initialState();
        return { ...newState, now: moment().valueOf(), locationID };
      }

      return state;
    }

    default:
      return state;
  }
};
