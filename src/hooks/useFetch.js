/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { useProtectedState } from './useProtectedState';

const _fetch = fetch;

const defaultOpts = {
  responseHandler: res => res,
  errorHandler: err => err,
  timeout: 30000,
};

/**
 * Custom hook to fetch data inside mounted component.
 *
 * If the calling component is unmounted or the timeout is reached,
 * the fetch is aborted.
 */
export const useFetch = (baseUrl, baseInit = {}, baseOpts = {}) => {
  const _timer = React.useRef(null);
  const _controller = React.useRef(null);

  const _isMounted = React.useRef(false);
  const _isBlocked = React.useRef(false);

  const isMounted = () => _isMounted.current;
  const isUnblocked = () => !_isBlocked.current;

  const [hasFetched, setHasFetched] = useProtectedState(false, isMounted);
  const [isLoading, setIsLoading] = useProtectedState(false, isMounted);
  const [response, setResponse] = useProtectedState(null, isMounted);
  const [error, setError] = useProtectedState(null, isMounted);

  React.useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
      if (_controller.current) _controller.current.abort();
    };
  }, []);

  const fetch = async (path, init, opts) => {
    const { responseHandler, errorHandler, timeout } = { ...defaultOpts, ...baseOpts, ...opts };

    const onResponse = res => setResponse(responseHandler(res));
    const onError = err => setError(errorHandler(err));

    const beforeFetch = () => {
      _isBlocked.current = true;
      // eslint-disable-next-line no-undef
      _controller.current = new AbortController();
      _timer.current = setTimeout(() => {
        if (_controller.current) _controller.current.abort();
      }, timeout);
      setIsLoading(true);
    };

    const tryFetch = async () => {
      const res = await _fetch(baseUrl + path, {
        ...baseInit,
        ...init,
        signal: _controller.current.signal,
      });
      const json = await res.json();
      return { ...res, json };
    };

    const afterFetch = () => {
      setHasFetched(true);
      _isBlocked.current = false;
      _controller.current = null;
      clearTimeout(_timer.current);
      setIsLoading(false);
    };

    const doFetch = async () => {
      try {
        beforeFetch();
        const res = await tryFetch();

        onResponse(res);
      } catch (err) {
        onError(err);
      } finally {
        afterFetch();
      }
    };

    if (isUnblocked()) doFetch();
  };

  const refresh = () => {
    setResponse(null);
    setError(null);
  };

  return { fetch, refresh, isLoading, response, error, hasFetched };
};
