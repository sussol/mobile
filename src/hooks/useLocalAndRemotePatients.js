import { useEffect, useReducer } from 'react';
import { getAuthHeader } from 'sussol-utilities';
import moment from 'moment';
import { UIDatabase } from '../database/index';
import { SETTINGS_KEYS } from '../settings/index';
import { getPatientRequestUrl, processPatientResponse } from '../sync/lookupApiUtils';
import { DATE_FORMAT } from '../utilities/constants';
import { useFetch } from './useFetch';
import { useThrottled } from './useThrottled';

const getAuthorizationHeader = () => {
  const username = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH);
  return getAuthHeader(username, password);
};

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

      return { ...state, loading: true, data: [], searchedWithNoResults: false };
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
 * patient lookup API.
 *
 * Merges the states such that there is a single state value for 'data', 'loading' etc, rather than
 * having to track multiple.
 */
export const useLocalAndRemotePatients = (initialValue = []) => {
  const syncUrl = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL);

  const [{ data, loading, searchedWithNoResults, error }, dispatch] = useReducer(
    reducer,
    initialValue,
    initialState
  );

  const { fetch, refresh, isLoading, response, hasFetched, error: fetchError } = useFetch(syncUrl);

  // If response is empty, we are not loading, and there is no error,
  // then we have tried to fetch and had no results.
  // Has fetched guards against the initial state of not loading and a response being empty.
  useEffect(() => {
    if (!isLoading && !response && !fetchError && hasFetched) {
      dispatch({ type: 'fetch_no_results' });
    }
  }, [response, isLoading, hasFetched, fetchError]);

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
    if (fetchError) dispatch({ type: 'fetch_error', payload: { error: fetchError } });
  }, [fetchError]);

  const onPressSearchOnline = searchParams => {
    refresh();
    fetch(
      getPatientRequestUrl(searchParams),
      { headers: { authorization: getAuthorizationHeader() } },
      { responseHandler: processPatientResponse }
    );
  };

  const getLocalPatients = searchParameters => {
    const { lastName, firstName, dateOfBirth } = searchParameters;

    if (!(lastName || firstName || dateOfBirth)) {
      return dispatch({ type: 'clear' });
    }
    dispatch({ type: 'fetch_start' });

    const query = 'lastName BEGINSWITH[c] $0 AND firstName BEGINSWITH[c] $1';
    let patients = UIDatabase.objects('Patient').filtered(query, lastName, firstName);

    if (dateOfBirth) {
      const dob = moment(dateOfBirth, DATE_FORMAT.DD_MM_YYYY, null, true);
      if (!dob.isValid()) {
        return patients;
      }

      const dayOfDOB = dob.startOf('day').toDate();
      const dayAfterDOB = dob.endOf('day').toDate();

      patients = patients.filtered('dateOfBirth >= $0 AND dateOfBirth < $1', dayOfDOB, dayAfterDOB);
    }

    if (patients.length) {
      return dispatch({
        type: 'fetch_success',
        payload: {
          data: patients.sorted('lastName'),
        },
      });
    }

    return dispatch({ type: 'fetch_no_results' });
  };

  // Throttle the get local patients such that the method will only be called 1/2 a second
  // after the last invocation, so when typing there is not constant queries happening each
  // press as there are potentially 100,00's of thousands of patients.
  const throttledGetLocalPatients = useThrottled(getLocalPatients, 500, [], {
    leading: false,
    trailing: true,
  });

  // getLocalPatients is throttled- ensure that the fetch_start action is still dispatched
  // on the first invocation so the loading state is changed.
  const getLocalPatientsWrapper = searchParameters => {
    dispatch({ type: 'fetch_start' });
    throttledGetLocalPatients(searchParameters);
  };

  return [
    { data, loading, searchedWithNoResults, error },
    onPressSearchOnline,
    getLocalPatientsWrapper,
  ];
};
