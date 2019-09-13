/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useEffect, useRef } from 'react';

/**
 * Simple custom hook which subscribes to navigation focus event,
 * (navigating to a page), which will invoke the passed callback
 * when navigating to it.
 *
 * Main use case is popping a page from the stack and returning to
 * a page whose state has been altered but the UI has not updated.
 *
 * - Only events for the calling page are subscribed to.
 * - Initial navigation focus event is NOT captured.
 *
 * @param {Func}   callback   callback to invoke on focusing the subscribed screen.
 * @param {Object} navigation react-navigation navigator object.
 */
export const useNavigationFocus = (callback, navigation) => {
  const subscription = useRef(null);

  const subscribe = () => {
    if (subscription.current) return;
    subscription.current = navigation.addListener('willFocus', callback);
  };

  const unSubscribe = () => {
    if (!subscription.current) return;
    subscription.current.remove();
  };

  // On-mount, On-unmount effect, subscribing/unsubscribing to willFocus navigation events.
  useEffect(() => {
    subscribe();
    return unSubscribe;
  }, []);

  return [subscription, subscribe, unSubscribe];
};
