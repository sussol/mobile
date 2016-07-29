import React from 'react';
import { ConfirmModal } from './ConfirmModal';
import globalStyles, { DARK_GREY } from '../../globalStyles';

/**
 * Presents a modal allowing the user to confirm or cancel finalising a record.
 * Will first check for an error that would prevent finalising, if an error checking
 * function is passed in within the finaliseItem.
 * @prop  {Realm}     database      App wide database
 * @prop  {boolean}   isOpen        Whether the modal is open
 * @prop  {function}  onClose       Function to call when finalise is cancelled
 * @prop  {object}    finaliseItem  An object carrying details of the item being
 *        													finalised, with the following fields:
 *                                  record        The record being finalised
 *                                  recordType    The type of database object being finalised
 *                                  checkForError A function returning an error message if the
 *        																				record cannot yet be finalised, or null otherwise
 *        													finaliseText  The text to display on the confirmation modal
 * @prop  {object}    user          The user who is finalising the record
 */
export function FinaliseModal(props) {
  if (!props.finaliseItem) return null;
  const { record, recordType, checkForError, finaliseText } = props.finaliseItem;
  if (!record || !record.isValid()) return null; // Record may have been deleted
  const errorText = !record.isFinalised && checkForError && checkForError(record);
  return (
    <ConfirmModal
      style={[globalStyles.finaliseModal]}
      textStyle={globalStyles.finaliseModalText}
      buttonContainerStyle={globalStyles.finaliseModalButtonContainer}
      cancelButtonStyle={globalStyles.finaliseModalButton}
      confirmButtonStyle={[globalStyles.finaliseModalButton,
                           globalStyles.finaliseModalConfirmButton]}
      backdropColor={DARK_GREY}
      backdropOpacity={0.97}
      buttonTextStyle={globalStyles.finaliseModalButtonText}
      isOpen={props.isOpen}
      questionText={errorText || finaliseText}
      cancelText={errorText ? 'Got it' : 'Cancel'}
      onConfirm={
        !errorText ? () => {
          if (record) {
            props.database.write(() => {
              record.finalise(props.database, props.user);
              props.database.save(recordType, record);
            });
          }
          if (props.onClose) props.onClose();
        } : null}
      onCancel={() => { if (props.onClose) props.onClose(); }}
    />);
}

FinaliseModal.propTypes = {
  database: React.PropTypes.object.isRequired,
  isOpen: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  finaliseItem: React.PropTypes.object,
  user: React.PropTypes.any,
};

FinaliseModal.defaultProps = {
  isOpen: false,
};
