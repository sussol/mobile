import React, { useCallback, useEffect } from 'react';

export const useRepeatCallbackPress = (callback, delay = 50) => {
  const repeatConfig = React.useRef({ isRepeating: false, timeout: null });
  const callbackRef = React.useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    repeatConfig.current.isPressed = true;

    const timeout = setInterval(() => {
      callbackRef.current();
    }, delay);
    repeatConfig.current.timeout = timeout;
  }, [callback, delay]);

  const end = useCallback(() => {
    clearInterval(repeatConfig.current.timeout);

    repeatConfig.current.isPressed = false;
    repeatConfig.current.timeout = null;
  }, []);

  return [start, end];
};
