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
    ? locations.filtered(sensors.map(({ location }) => `id == '${location?.id}'`).join(' OR '))
    : [];

  return {
    fridges: locationsWithASensor,
    selectedFridge: locationsWithASensor[0],
    fromDate: moment(new Date())
      .subtract(30, 'd')
      .startOf('day')
      .toDate(),
    toDate: moment(new Date())
      .endOf('day')
      .toDate(),
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

      const fromDate = new Date(date);

      return { ...state, fromDate };
    }

    case FRIDGE_ACTIONS.CHANGE_TO_DATE: {
      const { payload } = action;
      const { date } = payload;

      const toDate = new Date(date);

      return { ...state, toDate };
    }

    case 'Navigation/BACK':
    case 'Navigation/NAVIGATE': {
      const { routeName, payload } = action;
      const { prevRouteName } = payload ?? {};

      if (routeName === ROUTES.VACCINES || prevRouteName === ROUTES.VACCINES) return initialState();

      return state;
    }

    default:
      return state;
  }
};
