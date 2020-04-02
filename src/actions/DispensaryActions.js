/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const DISPENSARY_ACTIONS = {
  FILTER: 'Dispensary/filter',
  SORT: 'Dispensary/sort',
  SWITCH: 'Dispensary/switch',
  REFRESH: 'Dispensary/refresh',
  OPEN_LOOKUP_MODAL: 'Dispensary/openLookupModal',
  CLOSE_LOOKUP_MODAL: 'Dispensary/closeLookupModal',
};

const filter = searchTerm => ({ type: DISPENSARY_ACTIONS.FILTER, payload: { searchTerm } });

const sort = sortKey => ({ type: DISPENSARY_ACTIONS.SORT, payload: { sortKey } });

const switchDataSet = () => ({ type: DISPENSARY_ACTIONS.SWITCH });

const refresh = () => ({ type: DISPENSARY_ACTIONS.REFRESH });

const openLookupModal = () => ({ type: DISPENSARY_ACTIONS.OPEN_LOOKUP_MODAL });

const closeLookupModal = () => ({ type: DISPENSARY_ACTIONS.CLOSE_LOOKUP_MODAL });

export const DispensaryActions = {
  filter,
  sort,
  switchDataSet,
  refresh,
  openLookupModal,
  closeLookupModal,
};
