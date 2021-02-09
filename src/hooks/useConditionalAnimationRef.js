import { useRef, useEffect } from 'react';

// Most animations are considered 'interactions' - if there is no break
// in the interaction, then InteractionManager.runAfterInteractions() is
// never fired.
const DURATION_OFFSET = 50;

/**
 * Hook used to return a ref which should be applied to an animatable view created by
 * animatable that will trigger an animation to start/stop based on the condition passed.
 *
 * @param {boolean} condition a condition that when true will cause the animation to begin.
 * @param {string} animation the animation type see: react-native-animatable.
 * @param {number} duration the number of milliseconds per animation.
 */
export const useConditionalAnimationRef = (condition, animation = 'flash', duration = 1000) => {
  const ref = useRef();
  const interval = useRef();

  const start = () => {
    interval.current = setInterval(
      () => ref?.current[animation](duration),
      duration + DURATION_OFFSET
    );
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
