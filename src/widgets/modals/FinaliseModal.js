/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Client as BugsnagClient } from 'bugsnag-react-native';

import { NewConfirmModal } from '../modalChildren';

import { modalStrings } from '../../localization';

const bugsnagClient = new BugsnagClient();

/**
 * Presents a modal allowing the user to confirm or cancel finalising a record.
 * Will first check for an error that would prevent finalising, if an error checking
 * function is passed in within the finaliseItem.
 * @prop  {Realm}     database      App wide database
 * @prop  {boolean}   isOpen        Whether the modal is open
 * @prop  {function}  onClose       Function to call when finalise is cancelled
 * @prop  {object}    finaliseItem  An object carrying details of the item being
 *                                  finalised, with the following fields:
 *                                  record        The record being finalised
 *                                  recordType    The type of database object being finalised
 *                                  checkForError A function returning an error message if the
 *                                                record cannot yet be finalised, or null otherwise
 *                                  finaliseText  The text to display on the confirmation modal
 * @prop  {object}    user          The user who is finalising the record
 */
export const FinaliseModal = props => {
  const { finaliseItem, isOpen, runWithLoadingIndicator, database, user, onClose } = props;

  if (!finaliseItem) return null;
  const { record, recordType, checkForError, finaliseText } = finaliseItem;
  if (!record || !record.isValid()) return null; // Record may have been deleted
  let errorText = !record.isFinalised && checkForError && checkForError(record);

  // Wrapped in try-catch block so that finalise methods in schema can throw an error
  // as last line of defence
  const tryFinalise = () => {
    runWithLoadingIndicator(() => {
      try {
        if (record) {
          // Check for error again to cleaning show user warning
          // If the first attempt didn't catch it (was still writing changes)
          errorText = checkForError && checkForError(record);
          if (errorText) return;
          database.write(() => {
            record.finalise(database, user);
            database.save(recordType, record);
          });
        }
        if (onClose) onClose();
      } catch (error) {
        // Fling off to bugsnag so we can be notified finalise isn't
        // behaving
        bugsnagClient.notify(error);
      }
    });
  };

  return (
    <NewConfirmModal
      isOpen={isOpen}
      questionText={errorText || modalStrings[finaliseText]}
      confirmText={modalStrings.confirm}
      cancelText={errorText ? modalStrings.got_it : modalStrings.cancel}
      onConfirm={!errorText ? tryFinalise : null}
      onCancel={() => {
        if (onClose) onClose();
      }}
    />
  );
};

export default FinaliseModal;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
FinaliseModal.propTypes = {
  database: PropTypes.object.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  finaliseItem: PropTypes.object,
  user: PropTypes.any,
  runWithLoadingIndicator: PropTypes.func.isRequired,
};

FinaliseModal.defaultProps = {
  isOpen: false,
};
