/* eslint-disable import/prefer-default-export */
import { useEffect, useRef } from 'react';

import BaseDatabase from '../database/BaseDatabase';
import { debounce } from '../utilities';

/**
 * Custom hook for subscribing to database changes from sync.
 * Takes a callback to call when a notified of a particular
 * subscribed event. An array of data types to subscribe to
 * and the database to listen to changes.
 *
 * When a component calling this method unmounts, changes will
 * be unsubscribed.
 *
 * Callback is debounced, only being called after 10 seconds of the
 * last sync notification.
 *
 * Filtering is done in this hook, only notifying of sync changes
 * for record types passed in dataTypes
 *
 * @param {Func}   callback  A function to call when notified of changes.
 * @param {Array}  dataTypes Record types to listen to changes for.
 * @param {Object} database  Database to subscribe to.
 * Example dataTypes: ['Item', 'ItemBatch'] - must be in realm schema.
 *
 * @return {Array}
 *
 * isSubscribed - boolean indicating if currently subscribed
 * subscribe - function to subscribe, if not already
 * unSubscribe - function to unSubscribe, if already subscribed
 */
export const useSyncListener = (callback, dataTypes) => {
  // Reference for being subscribed
  const isSubscribed = useRef(false);

  // Debounced callback, only calling 10 seconds after the last invocation
  const debouncedCallback = debounce(callback, 10000);

  const subscribe = () => {
    if (isSubscribed.current) return null;
    isSubscribed.current = true;
    return BaseDatabase.addListener(filterResults);
  };

  const unSubscribe = callbackId => {
    if (!isSubscribed.current) return;
    BaseDatabase.removeListener(callbackId);
    isSubscribed.current = false;
  };

  // Subscribing to the database notifies of all changes made. Filter
  // notifications by sync causation and by the record types provided.
  const filterResults = (changeType, recordType, record, causedBy) => {
    if (dataTypes.includes(recordType) && causedBy === 'sync') {
      debouncedCallback(changeType, recordType, record, causedBy);
    }
  };

  // Subscribe to the database on first invocation and when the
  // calling component unmounts.
  useEffect(() => {
    const callbackId = subscribe();
    return () => unSubscribe(callbackId);
  }, []);

  return [isSubscribed, subscribe, unSubscribe];
};
