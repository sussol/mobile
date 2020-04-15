/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

import { getAuthHeader, AUTH_ERROR_CODES } from 'sussol-utilities';

import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';

const { SYNC_SITE_NAME, SYNC_SITE_PASSWORD_HASH } = SETTINGS_KEYS;
const CONNECTION_TIMEOUT_PERIOD = 10000;

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  EMPTY_RESPONSE: 'No records found',
};

const getAuthorizationHeader = () => {
  const username = UIDatabase.getSetting(SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SYNC_SITE_PASSWORD_HASH);
  return getAuthHeader(username, password);
};

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
  React.useEffect(() => {
    if (url) {
      (async () => {
        /* eslint-disable no-undef */
        const abortController = new AbortController();
        const bugsnagClient = new BugsnagClient();
        const { signal } = abortController;
        const headers = { authorization: getAuthorizationHeader() };
        try {
          const response = await fetch(url, { headers, signal, ...options });
          const { ok, status } = response;
          if (ok) {
            const responseData = await response.json();
            const { error: responseError } = responseData;
            if (responseError) throw new Error(responseError);
            if (!responseData.length) throw new Error(ERROR_CODES.RESPONSE_NO_RECORDS);
            if (isMounted.current) setData(responseData);
          } else {
            const connectionError = new Error(ERROR_CODES.CONNECTION_FAILURE);
            const authorizationError = new Error(ERROR_CODES.INVALID_PASSWORD);
            switch (status) {
              case 400:
                throw connectionError;
              case 401:
                throw authorizationError;
              default:
                bugsnagClient.notify(connectionError, content => {
                  content.requestUrl = url;
                  content.requestHeaders = headers;
                  content.responseStatus = status;
                });
                throw connectionError;
            }
          }
        } catch (responseError) {
          bugsnagClient.notify(responseError, content => {
            content.requestUrl = url;
            content.requestHeaders = headers;
          });
          if (isMounted.current) {
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
