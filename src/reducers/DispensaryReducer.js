/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { DISPENSARY_ACTIONS } from '../actions/DispensaryActions';
import { getColumns } from '../pages/dataTableUtilities/index';

const initialState = () => ({
  searchTerm: '',
  sortKey: 'firstName',
  isAscending: true,
  dataSet: 'patient',
  columns: getColumns('patient'),
});

export const DispensaryReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case DISPENSARY_ACTIONS.FILTER: {
      const { payload } = action;
      const { searchTerm } = payload;

      return { ...state, searchTerm };
    }

    case DISPENSARY_ACTIONS.SORT: {
      const { isAscending, sortKey } = state;
      const { payload } = action;
      const { sortKey: newSortKey } = payload;

      const newIsAscending = sortKey === newSortKey ? !isAscending : true;

      return { ...state, sortKey: newSortKey, isAscending: newIsAscending };
    }

    case DISPENSARY_ACTIONS.SWITCH: {
      const { dataSet } = state;

      const newDataSet = dataSet === 'patient' ? 'prescriber' : 'patient';
      const newColumns = getColumns(newDataSet);

      return {
        ...state,
        dataSet: newDataSet,
        columns: newColumns,
        sortKey: 'firstName',
        isAscending: true,
        searchTerm: '',
      };
    }

    default:
      return state;
  }
};
