/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { Client as BugsnagClient } from 'bugsnag-react-native';

import { getAuthHeader, AUTH_ERROR_CODES } from 'sussol-utilities';

import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';

const { SYNC_SITE_NAME, SYNC_SITE_PASSWORD_HASH } = SETTINGS_KEYS;

const CONNECTION_TIMEOUT_PERIOD = 10000;

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  EMPTY_RESPONSE: 'No records found',
};

const bugsnagClient = new BugsnagClient();

class BugsnagError extends Error {
  constructor(message, data, ...args) {
    super(message, ...args);
    bugsnagClient.notify(this, report => {
      report.errorMessage = message;
      report.metadata = data;
    });
  }
}

const getAuthorizationHeader = () => {
  const username = UIDatabase.getSetting(SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SYNC_SITE_PASSWORD_HASH);
  return getAuthHeader(username, password);
};

const isValidError = error => Object.values(ERROR_CODES).includes(error?.message);

/**
 * Custom hook to fetch data inside mounted component.
 *
 * Fetches data on component mount. If the calling component is unmounted or the timeout is reached,
 * the fetch is aborted.
 */
export const useFetch = (url, options = {}, timeout = CONNECTION_TIMEOUT_PERIOD) => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const isMounted = React.useRef(true);

  /* eslint-disable no-undef */
  const abortController = new AbortController();

  React.useEffect(() => {
    if (url) {
      (async () => {
        const { signal } = abortController;
        const headers = { authorization: getAuthorizationHeader() };
        try {
          const response = await fetch(url, { headers, signal, ...options });
          const { ok, status } = response;
          if (ok) {
            const responseData = await response.json();
            const { error: responseError } = responseData;
            if (responseError) throw new BugsnagError(responseError, { url, headers });
            if (!responseData.length) throw new Error(ERROR_CODES.EMPTY_RESPONSE);
            if (isMounted.current) setData(responseData);
          } else {
            switch (status) {
              case 400:
              default:
                throw new Error(ERROR_CODES.CONNECTION_FAILURE);
              case 401:
                throw new BugsnagError(ERROR_CODES.INVALID_PASSWORD, { url, headers });
            }
          }
        } catch (responseError) {
          if (isMounted.current) {
            if (!isValidError(responseError)) {
              responseError.message = ERROR_CODES.CONNECTION_FAILURE;
            }
            setError(responseError);
          }
        }
      })();
      const timer = setTimeout(() => {
        if (isMounted.current) setData();
        abortController.abort();
      }, timeout);
      return () => {
        isMounted.current = false;
        clearTimeout(timer);
        abortController.abort();
      };
    }
    return () => {
      isMounted.current = false;
    };
  }, [url]);

  const isFetching = !(data || error);
  return [data, error, isFetching];
};
