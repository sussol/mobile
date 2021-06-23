/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { ROW_DETAIL_KEYS, ROW_DETAIL_ACTIONS } from '../actions/RowDetailActions';

const initialState = () => ({
  rowData: null,
  detailKey: '',
});

export const RowDetailReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case ROW_DETAIL_ACTIONS.OPEN_ITEM_DETAIL: {
      const { payload } = action;
      const { rowData } = payload;

      return { ...state, rowData, detailKey: ROW_DETAIL_KEYS.ITEM_DETAIL };
    }

    case ROW_DETAIL_ACTIONS.OPEN_CUSTOMER_REQUISITION_ITEM_DETAIL: {
      const { payload } = action;
      const { rowData } = payload;

      return { ...state, rowData, detailKey: ROW_DETAIL_KEYS.CUSTOMER_REQUISITION_ITEM_DETAIL };
    }
    case ROW_DETAIL_ACTIONS.OPEN_SUPPLIER_REQUISITION_ITEM_DETAIL: {
      const { payload } = action;
      const { rowData } = payload;

      return { ...state, rowData, detailKey: ROW_DETAIL_KEYS.SUPPLIER_REQUISITION_ITEM_DETAIL };
    }

    case 'GO_BACK':
    case 'REPLACE':
    case 'NAVIGATE':
    case ROW_DETAIL_ACTIONS.CLOSE: {
      return initialState();
    }

    default:
      return state;
  }
};
