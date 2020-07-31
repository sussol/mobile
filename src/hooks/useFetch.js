/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

import { useProtectedState } from './useProtectedState';

/**
 * Custom hook to fetch data inside mounted component.
 *
 * If the calling component is unmounted or the timeout is reached,
 * the fetch is aborted.
 */
export const useFetch = url => {
  const _timer = React.useRef(null);
  const _controller = React.useRef(null);

  const _isMounted = React.useRef(false);
  const _isBlocked = React.useRef(false);

  const isMounted = () => _isMounted.current;
  const isUnblocked = () => !_isBlocked.current;

  const [isLoading, setIsLoading] = useProtectedState(false, isMounted);
  const [response, setResponse] = useProtectedState(null, isMounted);
  const [error, setError] = useProtectedState(null, isMounted);

  const reset = () => {
    setIsLoading(false);
    setResponse(null);
    setError(null);
  };

  React.useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
      if (_controller.current) _controller.current.abort();
    };
  }, []);

  const _fetch = async (path, init, opts) => {
    const { responseHandler = res => res, errorHandler = err => err, timeout = 10000 } = opts;

    const onResponse = async res => setResponse(await responseHandler(res));
    const onError = async err => setError(await errorHandler(err));

    const beforeFetch = () => {
      _isBlocked.current = true;
      // eslint-disable-next-line no-undef
      _controller.current = new AbortController();
      _timer.current = setTimeout(() => {
        if (_controller.current) _controller.current.abort();
      }, timeout);
      setIsLoading(true);
    };

    const tryFetch = async () => fetch(url + path, { ...init, signal: _controller.current.signal });

    const afterFetch = () => {
      _isBlocked.current = false;
      _controller.current = null;
      clearTimeout(_timer.current);
      setIsLoading(false);
    };

    const doFetch = async () => {
      try {
        beforeFetch();
        const res = await tryFetch();
        await onResponse(res);
      } catch (err) {
        await onError(err);
      } finally {
        afterFetch();
      }
    };

    if (isUnblocked()) doFetch();
  };

  return { fetch: _fetch, reset, isLoading, response, error };
};
