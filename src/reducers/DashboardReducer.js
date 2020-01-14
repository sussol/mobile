/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { DASHBOARD_ACTION_TYPES } from '../actions';
import { ROUTES } from '../navigation';

const initialState = () => ({
  reports: UIDatabase.objects('Report'),
  currentReport: null,
});

export const DashboardReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case DASHBOARD_ACTION_TYPES.SWITCH_REPORT: {
      const { payload } = action;
      const { reportID } = payload;
      const { reports } = state;
      return { ...state, currentReport: reports.filtered('id == $0', reportID)[0] };
    }

    case 'Navigation/NAVIGATE': {
      const { routeName } = action;
      const { reports } = state;
      if (routeName === ROUTES.DASHBOARD) return { ...state, currentReport: reports[0] || null };
      return state;
    }

    default:
      return state;
  }
};
