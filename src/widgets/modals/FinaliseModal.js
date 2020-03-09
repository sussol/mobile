/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Client as BugsnagClient } from 'bugsnag-react-native';

import { ConfirmForm } from '../modalChildren';

import { modalStrings } from '../../localization';
import { ModalContainer } from './ModalContainer';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { UIDatabase } from '../../database';
import { FinaliseActions } from '../../actions/FinaliseActions';
import { selectCurrentUser } from '../../selectors/user';

const bugsnagClient = new BugsnagClient();

/**
 * Presents a modal allowing the user to confirm or cancel finalising a record.
 * Will first check for an error that would prevent finalising, if an error checking
 * function is passed in within the finaliseItem.
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
export const FinaliseModalComponent = props => {
  const runWithLoadingIndicator = useLoadingIndicator();

  const { finaliseItem, currentUser, closeFinaliseModal, finaliseModalOpen } = props;

  if (!finaliseItem) return null;
  const { record, recordType, checkForError, finaliseText } = finaliseItem;
  if (!record || !record.isValid()) return null; // Record may have been deleted

  const errorText = !record.isFinalised && checkForError && checkForError(record);

  const tryFinalise = () => {
    closeFinaliseModal();
    runWithLoadingIndicator(() => {
      try {
        if (record) {
          UIDatabase.write(() => {
            record.finalise(UIDatabase, currentUser);
            UIDatabase.save(recordType, record);
          });
        }
      } catch (error) {
        bugsnagClient.notify(error);
      }
    });
  };

  return (
    <ModalContainer fullScreen={true} isVisible={finaliseModalOpen}>
      <ConfirmForm
        isOpen={finaliseModalOpen}
        questionText={errorText || modalStrings[finaliseText]}
        confirmText={modalStrings.confirm}
        cancelText={errorText ? modalStrings.got_it : modalStrings.cancel}
        onConfirm={!errorText ? tryFinalise : null}
        onCancel={closeFinaliseModal}
      />
    </ModalContainer>
  );
};

const mapStateToProps = state => {
  const { finalise } = state;
  const { finaliseModalOpen } = finalise;

  const currentUser = selectCurrentUser(state);

  return { finaliseModalOpen, currentUser };
};

const mapDispatchToProps = dispatch => {
  const closeFinaliseModal = () => dispatch(FinaliseActions.closeModal());

  return { closeFinaliseModal };
};

FinaliseModalComponent.defaultProps = {
  finaliseModalOpen: false,
};

FinaliseModalComponent.propTypes = {
  finaliseModalOpen: PropTypes.bool,
  closeFinaliseModal: PropTypes.func.isRequired,
  finaliseItem: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
};

export const FinaliseModal = connect(mapStateToProps, mapDispatchToProps)(FinaliseModalComponent);
