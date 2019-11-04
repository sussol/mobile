/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useRef, useState, useCallback, useMemo } from 'react';

import {
  DataTablePageReducer,
  getColumns,
  getPageInfoColumns,
  getPageInitialiser,
} from '../pages/dataTableUtilities';
import { getPageActions } from '../pages/dataTableUtilities/actions/getPageActions';

import { debounce } from '../utilities/index';

/**
 * Wrapper around useState, reimplementing useReducer with thunks.
 *
 * For DataTable pages within the app. Injects the initial state passed
 * with three fields:
 *
 * columns: an array of column objects defining the DataTable for the page.
 * getPageInfoColumns: closure function, returning an array of objects for
 *                     the pages PageInfo component.
 * PageActions: Object of composed ActionCreators for an individual page.
 *
 * Dispatch returned from useReducer is wrapped allowing the use
 * of thunks. Action creators can return either a plain object or a function.
 * If a function is returned, it is called, rather than dispatched,
 * allowing actions to perform side-effects.
 *
 * Returns the current state as well as three dispatchers for actions to the
 * reducer - a thunk dispatch (as above) and two debounced dispatchers - which
 * group sequential calls within a timeout period, calling either the last
 * invocation or the first within the timeout period.
 *
 * @param {String} page                   routeName for the current page.
 * @param {Object} initialState           Initial state of the reducer
 * @param {Func}   initialiser            Function to generate the initial state (optional)
 * @param {Object} pageObject             base PageObject for the page i.e. a Requisition.
 * @param {Number} debounceTimeout        Timeout period for a regular debounce
 * @param {Number} instantDebounceTimeout Timeout period for an instant debounce
 */
export const usePageReducer = (
  initialState,
  initialiser,
  debounceTimeout = 250,
  instantDebounceTimeout = 250
) => {
  const { page, pageObject } = initialState;
  const columns = useMemo(() => getColumns(page), []);
  const pageInfoColumns = useMemo(() => getPageInfoColumns(page), []);
  const PageActions = useMemo(() => getPageActions(page), []);
  const pageInitialiser = useMemo(() => initialiser || getPageInitialiser(page), []);

  const [pageState, setPageState] = useState({
    ...(pageInitialiser ? pageInitialiser(pageObject) : initialState),
    columns,
    getPageInfoColumns: pageInfoColumns,
    PageActions,
  });

  // Reference to the current state object, independent of closures.
  const stateRef = useRef(pageState);
  const getState = () => stateRef.current;

  // Basic dispatch function.
  const dispatch = useCallback(action => {
    const newState = DataTablePageReducer(getState(), action);
    setPageState(newState);
    stateRef.current = newState;
  }, []);

  const thunkDispatcher = useCallback(
    action => (typeof action === 'function' ? action(thunkDispatcher, getState) : dispatch(action)),
    []
  );

  const debouncedDispatch = useCallback(debounce(thunkDispatcher, debounceTimeout), []);
  const instantDebouncedDispatch = useCallback(
    debounce(thunkDispatcher, instantDebounceTimeout, true),
    []
  );

  return [pageState, thunkDispatcher, instantDebouncedDispatch, debouncedDispatch];
};

export default usePageReducer;
