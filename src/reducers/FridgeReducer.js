/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import moment from 'moment';

import { UIDatabase } from '../database';
import { FRIDGE_ACTIONS } from '../actions/FridgeActions';
import { ROUTES } from '../navigation';

const initialState = () => {
  const sensors = UIDatabase.objects('Sensor');
  const locations = UIDatabase.objects('Location');
  const locationsWithASensor = sensors.length
    ? locations.filtered(sensors.map(({ location }) => `id == '${location.id}'`).join(' OR '))
    : [];

  return {
    fridges: locationsWithASensor,
    selectedFridge: locationsWithASensor[0],
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

    case FRIDGE_ACTIONS.CHANGE_FROM_DATE: {
      const { payload } = action;
      const { date } = payload;

      return { ...state, fromDate: date };
    }

    case FRIDGE_ACTIONS.CHANGE_TO_DATE: {
      const { payload } = action;
      const { date } = payload;

      return { ...state, toDate: date };
    }

    case 'Navigation/BACK':
    case 'Navigation/NAVIGATE': {
      const { routeName } = action;

      if (routeName === ROUTES.VACCINES) return initialState;
      return state;
    }

    default:
      return state;
  }
};
