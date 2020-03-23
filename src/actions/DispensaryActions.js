/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const DISPENSARY_ACTIONS = {
  FILTER: 'Dispensary/filter',
  SORT: 'Dispensary/sort',
  SWITCH: 'Dispensary/switch',
  REFRESH: 'Dispensary/refresh',
  LOOKUP_RECORD: 'Dispensary/lookupRecord',
};

const filter = searchTerm => ({ type: DISPENSARY_ACTIONS.FILTER, payload: { searchTerm } });

const sort = sortKey => ({ type: DISPENSARY_ACTIONS.SORT, payload: { sortKey } });

const switchDataSet = () => ({ type: DISPENSARY_ACTIONS.SWITCH });

const refresh = () => ({ type: DISPENSARY_ACTIONS.REFRESH });

const lookupRecord = () => ({ type: DISPENSARY_ACTIONS.LOOKUP_RECORD });
export const DispensaryActions = {
  filter,
  sort,
  switchDataSet,
  refresh,
  lookupRecord,
};
