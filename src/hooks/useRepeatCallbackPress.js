import React from 'react';

export const useRepeatCallbackPress = (callback, delay = 50) => {
  const repeatConfig = React.useRef({ isRepeating: false, timeout: null });

  const start = React.useCallback(() => {
    repeatConfig.current.isPressed = true;
    const timeout = setInterval(() => {
      callback();
    }, delay);
    repeatConfig.current.timeout = timeout;
  }, [callback, delay]);

  const end = React.useCallback(() => {
    clearInterval(repeatConfig.current.timeout);

    repeatConfig.current.isPressed = false;
    repeatConfig.current.timeout = null;
  });

  return [start, end];
};
