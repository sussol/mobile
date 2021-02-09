import { useRef, useEffect } from 'react';

/**
 *
 *
 * @param {*} condition
 * @param {*} animation
 * @param {*} duration
 */
export const useConditionalAnimationRef = (condition, animation = 'flash', duration = 1000) => {
  const ref = useRef();
  const interval = useRef();

  const start = () => {
    interval.current = setInterval(() => ref?.current[animation](duration), duration);
  };

  const stop = () => {
    clearInterval(interval.current);
    ref?.current?.stopAnimation();
  };

  useEffect(() => {
    if (condition) start();
    else stop();

    return stop;
  }, [condition]);

  return ref;
};
