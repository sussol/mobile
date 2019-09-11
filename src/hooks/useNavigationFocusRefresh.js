/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useEffect, useRef } from 'react';
import { refreshData } from '../pages/dataTableUtilities/tableActions';

/**
 * Simple custom hook which subscribes to navigation focus event,
 * (navigating to a page), which will refresh data on that page
 * when navigating to it. Main use case is popping a page from the
 * stack and returning to a page whose state has been altered but
 * the UI has not updated/re-rendered.
 *
 * - Using this hook will REFRESH ALL DATA on navigating to this page.
 * - ENSURE THE CALLING SCREEN HAS A `refreshData` REDUCER CASE.
 * - Only events for the calling page are subscribed to.
 * - Initial navigation focus event is NOT captured.
 *
 * @param {Func}   dispatch   Page reducer
 * @param {Object} navigation react-navigation navigator object.
 */
export const useNavigationFocusRefresh = (dispatch, navigation) => {
  const subscription = useRef(null);

  const subscribe = () => {
    if (subscription.current) return;
    subscription.current = navigation.addListener('willFocus', () => dispatch(refreshData()));
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
