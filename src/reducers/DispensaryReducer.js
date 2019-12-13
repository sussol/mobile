import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database/index';

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const initialState = () => ({
  currentTab: 0,
  patient: null,
  prescriber: null,
  itemsById: {},
  items: [],
});

export const switchTab = currentTab => ({
  type: 'SWITCH_TAB',
  payload: { currentTab },
});

export const selectPrescriber = prescriberID => (dispatch, getState) => {
  const { dispensary } = getState();

  const { prescription, currentTab } = dispensary;

  const prescriber = UIDatabase.get('Prescriber', prescriberID);

  UIDatabase.write(() =>
    UIDatabase.update('Transaction', {
      ...prescription,
      prescriber,
    })
  );

  dispatch({ type: 'SWITCH_TAB', payload: { nextTab: currentTab + 1 } });
};

export const DispensaryReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;

      return { ...state, prescription: transaction };
    }

    case 'SWITCH_TAB': {
      const { payload } = action;
      const { nextTab } = payload;
      return { ...state, currentTab: nextTab };
    }
    default:
      return state;
  }
};
