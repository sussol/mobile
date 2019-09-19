/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { newSortDataBy } from '../../../utilities';

/**
 * Sorts the current set of data by the provided
 * key and direction in action.
 *
 * sortBy: String key of the field of the objects to sort by, see sortDataBy.js
 */
export const sortData = (state, action) => {
  const { data, isAscending, sortBy } = state;
  const { payload } = action;
  const { sortBy: newSortBy } = payload;

  // If the new sortBy is the same as the sortBy in state, then invert isAscending
  // that was set by the last sortBy action. Otherwise, default to true.
  const newIsAscending = newSortBy === sortBy ? !isAscending : true;

  const newData = newSortDataBy(data, newSortBy, newIsAscending);

  return { ...state, data: newData, sortBy: newSortBy, isAscending: newIsAscending };
};

/**
 * Filters the backingData WITH REALM, returning a JS array. Sorting
 * is held stable.
 */
export const filterData = (state, action) => {
  const { backingData, filterDataKeys, sortBy, isAscending } = state;
  const { payload } = action;
  const { searchTerm } = payload;

  const queryString = filterDataKeys
    .map(filterTerm => `${filterTerm} CONTAINS[c]  $0`)
    .join(' OR ');

  const filteredData = backingData.filtered(queryString, searchTerm).slice();

  return {
    ...state,
    data: sortBy ? newSortDataBy(filteredData, sortBy, isAscending) : filteredData,
    searchTerm,
  };
};

/**
 * Simply refresh's the data object in state to correctly match the
 * backingData. Used for when side effects such as finalizing manipulate
 * the state of a page from outside the reducer.
 */
export const refreshData = state => {
  const { backingData, sortBy, isAscending } = state;

  const newData = sortBy
    ? newSortDataBy(backingData.slice(), sortBy, isAscending)
    : backingData.slice();

  return { ...state, data: newData, searchTerm: '', showAll: true };
};

/**
 * Filters `backingData` by status, setting `data` as all elements whose
 * status is finalised.
 */
export const showFinalised = state => {
  const { backingData } = state;

  const newData = backingData.filtered('status == $0', 'finalised');

  return { ...state, data: newData, showFinalised: true };
};

/**
 * Filters `backingData` by status, setting `data` as all elements whose
 * status is not finalised.
 */
export const showNotFinalised = state => {
  const { backingData } = state;

  const newData = backingData.filtered('status != $0', 'finalised');

  return { ...state, data: newData, showFinalised: false };
};

/**
 * Filters backingData by the elements isLessThanThresholdMOS field.
 */
export const hideOverStocked = state => {
  const { backingData } = state;

  const newData = backingData.filter(item => item.isLessThanThresholdMOS);

  return { ...state, data: newData, showAll: false };
};

/**
 * Filters by backingData elements `hasStock` field.
 */
export const hideStockOut = state => {
  const { backingData } = state;

  const newData = backingData.filter(item => item.hasStock);

  return { ...state, data: newData, showAll: false, searchTerm: '' };
};

/**
 * Creates adds the passed record to the HEAD of the current
 * data array.
 *
 * Also removes the current sorting and filter.
 */
export const addRecord = (state, action) => {
  const { backingData } = state;
  const { payload } = action;
  const { record } = payload;

  return {
    ...state,
    data: [record, ...backingData.slice(0, backingData.length - 1)],
    modalKey: '',
    sortBy: '',
    searchTerm: '',
  };
};

export const TableReducerLookup = {
  hideStockOut,
  showNotFinalised,
  showFinalised,
  addRecord,
  hideOverStocked,
  refreshData,
  filterData,
  sortData,
};
