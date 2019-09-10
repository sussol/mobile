/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useEffect, useState } from 'react';
import { refreshData } from '../pages/dataTableUtilities/actions';

/**
 * Simple custom hook which subscribes to navigation focus event,
 * (navigating to a page), which will refresh data on that page
 * when navigating to it. Main use case is popping a page from the
 * stack and returning to a page whose state has been altered but
 * the UI has not updated/re-rendered.
 *
 * - ENSURE THE CALLING SCREEN HAS A `refreshData` REDUCER CASE.
 * - Only events for the calling page are subscribed to.
 * - Initial navigation focus event is NOT captured.
 *
 * @param {Func}   dispatch   Page reducer
 * @param {Object} navigation react-navigation navigator object.
 */
export const useNavigationFocusRefresh = (dispatch, navigation) => {
  const [subscription, setSubscription] = useState(null);

  const unSubscribe = () => subscription.remove();

  // On-mount, On-unmount effect, subscribing/unsubscribing to willFocus navigation
  // events.
  useEffect(() => {
    const newSubscription = navigation.addListener('willFocus', () => dispatch(refreshData()));
    setSubscription(newSubscription);

    return () => subscription.remove();
  }, []);

  return [subscription, unSubscribe];
};
