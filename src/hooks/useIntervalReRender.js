import { useEffect, useState, useRef } from 'react';

/**
 * Forces a re-render of a component every {interval} milliseconds.
 *
 * Use case is primarily refreshing to show countdowns. Use should
 * generally be avoided.
 * @param {number} interval
 */
export const useIntervalReRender = interval => {
  const [, setState] = useState({});
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => setState({}), interval);
    return () => clearInterval(intervalRef.current);
  }, [interval]);
};
