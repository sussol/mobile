/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useEffect, useRef } from 'react';

/**
 * Simple custom hook which subscribes to navigation focus/blur events,
 * (navigating to/from a page), which will invoke the passed callback.
 *
 * Main use case is popping a page from the stack and returning to
 * a page whose state has been altered but the UI has not updated or
 * triggering a callback when navigating away from a page
 * - Only events for the calling page are subscribed to.
 * - Initial navigation focus event is NOT captured.
 *
 * @param {Func}   willFocusCallback callback to invoke on focusing the subscribed screen.
 * @param {Func}   willBlurCallback  callback to invoke on focusing the subscribed screen.
 * @param {Object} navigation        react-navigation navigator object.
 */
export const useNavigationFocus = (navigation, willFocusCallback, willBlurCallback) => {
  const willFocusSub = useRef(null);
  const willBlurSub = useRef(null);

  const subscribe = () => {
    if (!willFocusSub && willFocusCallback) {
      willFocusSub.current = navigation.addListener('willFocus', () => willFocusCallback());
    }
    if (!willBlurSub.current && willBlurCallback) {
      willBlurSub.current = navigation.addListener('willBlur', () => willBlurCallback());
    }
  };

  const unSubscribe = () => {
    if (willFocusSub.current) willFocusSub.current.remove();
    if (willBlurSub.current) willBlurSub.current.remove();
  };

  // On-mount/On-unmount effect, subscribing/unsubscribing to navigation events given the callbacks.
  useEffect(() => {
    subscribe();
    return unSubscribe;
  }, []);

  return [willFocusSub, willBlurSub, subscribe, unSubscribe];
};
