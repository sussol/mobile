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

  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);

  const reset = () => {
    _isBlocked.current = true;
    clearTimeout(_timer.current);
    if (_controller.current) _controller.current.abort();
    setResponse(null);
    setError(null);
  };

  React.useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
      reset();
    };
  }, []);

  const _fetch = async (path, init, opts) => {
    const { responseHandler = res => res, errorHandler = err => err, timeout = 10000 } = opts;

    const isMounted = () => _isMounted.current;
    const isUnblocked = () => !_isBlocked.current;
    const isMountedAndUnblocked = () => isMounted() && isUnblocked();

    const onResponse = async res => {
      const processedResponse = await responseHandler(res);
      doIf(isMounted, setResponse, processedResponse);
    };

    const onError = async err => {
      const processedError = await errorHandler(err);
      doIf(isMounted, setError, processedError);
    };

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
        doIf(isMountedAndUnblocked, beforeFetch);
        const res = await doIf(isMounted, tryFetch);
        await doIf(isMounted, onResponse, res);
      } catch (err) {
        await doIf(isMounted, onError(err));
      } finally {
        doIf(isMounted, afterFetch);
      }
    };

    doIf(isMountedAndUnblocked, doFetch);
  };

  return { fetch: _fetch, reset, isLoading, response, error };
};
