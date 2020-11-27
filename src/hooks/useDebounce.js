import { useCallback } from 'react';

export const useDebounce = (func, waitAmount, immediate) => {
  const debounceIt = () => {
    // Closure timeout ref for all subsequent calls
    let timeout;

    // Return a func wrapper with the timeout var ref closure
    return (...args) => {
      const doItLater = () => {
        timeout = null;
        if (!immediate) func(...args);
        return null;
      };

      // If the immediate flag is true and there is no timeout
      // already, just execute.
      const doItNow = immediate && !timeout;

      // Otherwise, clear the timeout if there is one from the
      // potential previous call and reschedule the func call.
      clearTimeout(timeout);
      timeout = setTimeout(doItLater, waitAmount);

      if (doItNow) return func(...args);
      return timeout;
    };
  };

  return useCallback(debounceIt(func, waitAmount, immediate), [func, waitAmount, immediate]);
};
