import React from 'react';
import { ConfirmModal } from './ConfirmModal';
import globalStyles, { DARK_GREY } from '../../globalStyles';

const text = 'Finalise will lock this record permanently and cause stock level changes '
           + 'to take effect.';

/**
 * Presents a modal allowing the user to confirm or cancel finalising a record.
 * Will first check for an error that would prevent finalising, if an error checking
 * function is passed in through props.
 * @prop  {Realm}     database      App wide database
 * @prop  {boolean}   isOpen        Whether the modal is open
 * @prop  {function}  onClose       Function to call when finalise is cancelled
 * @prop  {object}    record        The record being finalised
 * @prop  {string}    recordType    The type of database object being finalised
 * @prop  {function}  checkForError A function returning an error message if the
 *        													record cannot yet be finalised, or null otherwise
 * @prop  {object}    user          The user who is finalising the record
 */
export function FinaliseModal(props) {
  const errorText = props.checkForError && props.checkForError(props.record);
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
      questionText={errorText || text}
      cancelText="Got it"
      onConfirm={!errorText ? () => {
        const record = props.record;
        if (record) {
          props.database.write(() => {
            record.finalise(props.database, props.user);
            props.database.save(props.recordType, record);
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
  record: React.PropTypes.object,
  recordType: React.PropTypes.string,
  checkForError: React.PropTypes.func,
  user: React.PropTypes.object,
};

FinaliseModal.defaultProps = {
  isOpen: false,
};
