/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const DISPENSARY_ACTIONS = {
  FILTER: 'Dispensary/filter',
  SORT: 'Dispensary/sort',
  SWITCH: 'Dispensary/switch',
};

const filter = searchTerm => ({ type: DISPENSARY_ACTIONS.FILTER, payload: { searchTerm } });

const sort = sortKey => ({ type: DISPENSARY_ACTIONS.SORT, payload: { sortKey } });

const switchDataSet = () => ({ type: DISPENSARY_ACTIONS.SWITCH });

export const DispensaryActions = {
  filter,
  sort,
  switchDataSet,
};
