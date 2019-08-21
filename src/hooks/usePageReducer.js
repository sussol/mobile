/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useReducer, useCallback } from 'react';
import getReducer from '../pages/dataTableUtilities/reducer/getReducer';
import getColumns from '../pages/dataTableUtilities/columns';
import getPageInfo from '../pages/dataTableUtilities/pageInfo';
import { debounce } from '../utilities/index';

/**
 * useReducer wrapper for pages within the app. Creates a
 * composed reducer through getReducer for a particular
 * page as well as fetching the required columns and inserting
 * them into the initial state of the component.
 *
 * Returns the current state as well as three dispatchers for
 * actions to the reducer - a regular dispatch and two debounced
 * dispatchers - which group sequential calls within the timeout
 * period, call either the last invocation or the first within
 * the timeout period.
 * @param {String} page                   routeName for the current page.
 * @param {Object} initialState           Initial state of the reducer
 * @param {Number} debounceTimeout        Timeout period for a regular debounce
 * @param {Number} instantDebounceTimeout Timeout period for an instant debounce
 */
const usePageReducer = (
  page,
  initialState,
  debounceTimeout = 250,
  instantDebounceTimeout = 250
) => {
  const columns = getColumns(page);
  const pageInfo = getPageInfo(page);
  const memoizedReducer = useCallback(getReducer(page), []);
  const [state, dispatch] = useReducer(memoizedReducer, {
    ...initialState,
    columns,
    pageInfo,
  });

  const debouncedDispatch = useCallback(debounce(dispatch, debounceTimeout), []);
  const instantDebouncedDispatch = useCallback(
    debounce(dispatch, instantDebounceTimeout, true),
    []
  );

  return [state, dispatch, instantDebouncedDispatch, debouncedDispatch];
};

export default usePageReducer;
