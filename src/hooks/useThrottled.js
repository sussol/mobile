import throttle from 'lodash.throttle';
import { useCallback } from 'react';

/**
 * Simple wrapper over useCallback that also
 * throttles the passed func.
 *
 * Options described here: https://lodash.com/docs/4.17.15#throttle
 *
 * @param {func} fn any function
 * @param {num} waitTime throttling time in ms
 * @param {array} deps deps array for useCallback
 * @param {object} options options above
 * @returns a memoized and throttled function which is only invoked every waitTime ms.
 */
export const useThrottled = (
  fn,
  waitTime,
  deps = [],
  options = { leading: false, trailing: true }
) => useCallback(throttle(fn, waitTime, options), deps);
