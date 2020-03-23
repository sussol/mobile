/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { DISPENSARY_ACTIONS } from '../actions/DispensaryActions';
import { getColumns } from '../pages/dataTableUtilities';
import { UIDatabase } from '../database';
import { ROUTES } from '../navigation';
import { FORMS } from '../widgets/constants';

const initialState = () => ({
  searchTerm: '',
  sortKey: 'firstName',
  isAscending: true,
  dataSet: 'patient',
  columns: getColumns(FORMS.PATIENT),
  data: UIDatabase.objects('Patient'),
  isLookupModalOpen: false,
});

export const DispensaryReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName } = action;

      if (routeName === ROUTES.DISPENSARY) return initialState();
      return state;
    }

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
      const newData = UIDatabase.objects(newDataSet === 'patient' ? 'Patient' : 'Prescriber');

      return {
        ...state,
        dataSet: newDataSet,
        columns: newColumns,
        sortKey: 'firstName',
        isAscending: true,
        searchTerm: '',
        data: newData,
      };
    }
    case DISPENSARY_ACTIONS.REFRESH: {
      const { dataSet } = state;

      const objectType = dataSet === 'patient' ? 'Patient' : 'Prescriber';
      const newData = UIDatabase.objects(objectType);

      return { ...state, data: newData };
    }

    case DISPENSARY_ACTIONS.LOOKUP_RECORD: {
      return { ...state, isLookupModalOpen: true };
    }
    default:
      return state;
  }
};
