/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

const doIf = (ifThis, doThis, ...withThese) => (ifThis() ? doThis(...withThese) : null);

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

  const [isLoading, _setIsLoading] = React.useState(false);
  const [response, _setResponse] = React.useState(null);
  const [error, _setError] = React.useState(null);

  const isMounted = () => _isMounted.current;
  const isUnblocked = () => !_isBlocked.current;

  const setIsLoading = _isLoading => doIf(isMounted, _setIsLoading, _isLoading);
  const setResponse = _response => doIf(isMounted, _setResponse, _response);
  const setError = _error => doIf(isMounted, _setError, _error);

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

    doIf(isUnblocked, doFetch);
  };

  return { fetch: _fetch, reset, isLoading, response, error };
};
