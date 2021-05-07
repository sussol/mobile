import { useEffect, useReducer } from 'react';
import {
  getAuthorizationHeader,
  getPatientHistoryRequestUrl,
  getServerURL,
  processPatientHistoryResponse,
} from '../sync/lookupApiUtils';
import { useFetch } from './useFetch';
import { useThrottled } from './useThrottled';
import { selectSortedPatientHistory } from '../selectors/patient';

const initialState = (initialValue = []) => ({
  data: initialValue,
  loading: false,
  error: false,
  searchedWithNoResults: false,
});

const reducer = (state, action) => {
  const { type } = action;

  switch (type) {
    case 'fetch_success': {
      const { payload } = action;
      const { data } = payload;

      return { ...state, data: data ?? [], loading: false, searchedWithNoResults: false };
    }
    case 'fetch_start': {
      const { loading } = state;

      if (loading) return state;

      return { ...state, loading: true, data: [], searchedWithNoResults: false, noMore: false };
    }
    case 'fetch_no_results': {
      return { ...state, data: [], searchedWithNoResults: true, loading: false };
    }

    case 'fetch_error': {
      const { payload } = action;
      const { error } = payload;

      return { ...state, error, loading: false, searchedWithNoResults: false };
    }

    case 'clear': {
      return initialState();
    }
    default: {
      return state;
    }
  }
};

/**
 * Hook to help a component to be able to find patients in the local database or through the
 * patient history API.
 *
 * Merges the states such that there is a single state value for 'data', 'loading' etc, rather than
 * having to track multiple.
 */
export const useLocalAndRemotePatientHistory = (patient, initialValue = []) => {
  const [{ data, loading, searchedWithNoResults, error }, dispatch] = useReducer(
    reducer,
    initialValue,
    initialState
  );

  const { fetch, refresh, isLoading, response, error: fetchError } = useFetch(getServerURL());

  // If response is empty, we are not loading, and there is no error,
  // then we have tried to fetch and had no results.
  // Has fetched guards against the initial state of not loading and a response being empty.
  useEffect(() => {
    const noResults = fetchError?.message === 'No records found';
    if (noResults) {
      dispatch({ type: 'fetch_no_results' });
    }
  }, [fetchError]);

  // When isLoading is set as true, sync this with our merged state.
  useEffect(() => {
    if (isLoading) dispatch({ type: 'fetch_start' });
  }, [isLoading]);

  // When response changes and we have a new response, assign this as our set of data, merging
  // with our combined state.
  useEffect(() => {
    if (response) dispatch({ type: 'fetch_success', payload: { data: response } });
  }, [response]);

  // Synchronizing this error with our merged state.
  useEffect(() => {
    if (fetchError && fetchError.message !== 'No records found') {
      dispatch({ type: 'fetch_error', payload: { error: fetchError } });
    }
  }, [fetchError]);

  // Fetch local history on load
  useEffect(() => {
    dispatch({ type: 'fetch_start' });
    getLocalHistory(patient);
  }, [patient]);

  const onPressSearchOnline = () => {
    const { currentPatient } = patient;
    const { id } = currentPatient;
    dispatch({ type: 'clear' });
    refresh();
    dispatch({ type: 'fetch_start' });
    fetch(
      getPatientHistoryRequestUrl(id),
      { headers: { authorization: getAuthorizationHeader() } },
      { responseHandler: processPatientHistoryResponse }
    );
  };

  const getLocalHistory = () => {
    refresh();
    const patientHistory = selectSortedPatientHistory({ patient });

    if (patientHistory.length) {
      return dispatch({
        type: 'fetch_success',
        payload: {
          data: patientHistory,
        },
      });
    }

    return dispatch({ type: 'fetch_no_results' });
  };

  const throttledSearchOnline = useThrottled(onPressSearchOnline, 500, []);

  return [{ data, loading, searchedWithNoResults, error }, throttledSearchOnline];
};
