/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

import 'abortcontroller-polyfill';

import { getAuthHeader, AUTH_ERROR_CODES } from 'sussol-utilities';

import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';

const { SYNC_SITE_NAME, SYNC_SITE_PASSWORD_HASH } = SETTINGS_KEYS;
const CONNECTION_TIMEOUT_PERIOD = 10000;

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  EMPTY_RESPONSE: 'No records found',
};

/* eslint-disable no-undef */
const { AbortController } = window;

const getAuthorizationHeader = () => {
  const username = UIDatabase.getSetting(SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SYNC_SITE_PASSWORD_HASH);
  return { authorization: getAuthHeader(username, password) };
};

/**
 * Simple custom hook to fetch data inside mounted component.
 */
export const useFetch = (url, options = {}, timeout = CONNECTION_TIMEOUT_PERIOD) => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    setIsFetching(true);
    (async () => {
      try {
        const { authorization } = getAuthorizationHeader();
        const { signal } = abortController;
        const response = await fetch(url, { headers: { authorization }, signal, ...options });
        const { ok, status } = response;
        if (ok) {
          const responseData = await response.json();
          const { error: responseError } = responseData;
          if (responseError) throw new Error(responseError);
          if (!responseData.length) throw new Error(ERROR_CODES.RESPONSE_NO_RECORDS);
          if (mounted) {
            setData(responseData);
            setIsFetching(false);
          }
        } else {
          switch (status) {
            case 400:
              throw new Error(ERROR_CODES.CONNECTION_FAILURE);
            case 401:
              throw new Error(ERROR_CODES.INVALID_PASSWORD);
            default:
              throw new Error(ERROR_CODES.CONNECTION_FAILURE);
          }
        }
      } catch (responseError) {
        if (mounted) {
          setError(responseError);
          setIsFetching(false);
        }
      }
    })();

    const cleanup = () => {
      mounted = false;
      abortController.abort();
    };

    setTimeout(() => {
      if (mounted) setData();
      abortController.abort();
    }, timeout);

    return cleanup;
  }, []);

  return [data, error, isFetching];
};
