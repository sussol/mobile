import React from 'react';
import { ConfirmModal } from './ConfirmModal';
import globalStyles, { DARK_GREY } from '../../globalStyles';

const text = 'Finalise will lock this record permanently and cause stock level changes '
           + 'to take effect.';

export function FinaliseModal(props) {
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
      questionText={text}
      onConfirm={() => {
        const record = props.record;
        if (record) {
          props.database.write(() => {
            record.finalise(props.database, props.user);
            props.database.save(props.recordType, record);
          });
        }
        if (props.onClose) props.onClose();
      }}
      onCancel={() => { if (props.onClose) props.onClose(); }}
    />);
}

FinaliseModal.propTypes = {
  database: React.PropTypes.object.isRequired,
  isOpen: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  record: React.PropTypes.object,
  recordType: React.PropTypes.string,
  user: React.PropTypes.object,
};

FinaliseModal.defaultProps = {
  isOpen: false,
};
