/* eslint-disable import/prefer-default-export */
import { useEffect, useRef } from 'react';

import { CHANGE_TYPES } from 'react-native-database';

import { UIDatabase } from '../database';

/**
 * Custom hook for subscribing to database changes for a particular record which
 * should trigger the callback.
 *
 * Subscribes to the database, BEING CALLED ON ALL EVENTS which occur. Events are filtered
 * by recordType, change type and ID of the record causing the event. If these all match,
 * check the particular keys which should cause a callback.
 *
 * Use case: Finalizing an invoice prunes items - this side-effect does not go through the
 * reducer and leaves state inconsistent.
 *
 * @param {Func}    callback             callback to invoke on receiving the event.
 * @param {Object}  recordToListenFor    An object in the database to listen to.
 * @param {String}  recordTypeToListFor  The object type to listen to.
 *
 * @return {Array}
 * subscription - boolean indicating if currently subscribed
 * subscribe    - function to subscribe, if not already
 * unSubscribe  - function to unSubscribe, if already subscribed
 */
export const useRecordListener = (callback, recordToListenFor, recordTypeToListenFor) => {
  const subscription = useRef();

  // Subscribing to the database notifies of all changes made. Filter
  // notifications by sync causation and by the record types provided.
  const filterResults = (changeType, recordType, record = {}) => {
    // Try to quickly ignore all updates not for the specific record type - i.e. Requisition.
    if (recordTypeToListenFor !== recordType) return null;

    // Ignore all updates which aren't caused by updates.
    if (changeType !== CHANGE_TYPES.UPDATE) return null;

    // Safely get the ID of the record.
    const recordId = record && record.id;
    const { id } = recordToListenFor;
    if (recordId !== id) return null;

    // The record being listened to has been updated. Determine if a refresh is required.
    // ---- Additional checks should go here -----
    if (!record.isFinalised) return null;

    return callback();
  };

  // Subscribe to the database using the inner filter callback.
  const subscribe = () => {
    if (subscription.current) return null;
    return UIDatabase.addListener(filterResults);
  };

  // Unsubscribe from changes to the database.
  const unSubscribe = callbackId => {
    if (!subscription.current) return null;
    return UIDatabase.removeListener(callbackId);
  };

  // Subscribe to the database on first invocation. Unsubscribe on unmounting
  useEffect(() => {
    const callbackId = subscribe();
    subscription.current = callbackId;
    return () => unSubscribe(callbackId);
  }, []);

  return [subscription, subscribe, unSubscribe];
};
