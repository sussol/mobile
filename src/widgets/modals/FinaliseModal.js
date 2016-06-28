import React from 'react';

import { ConfirmModal } from './ConfirmModal';

export function FinaliseModal(props) {
  return (
    <ConfirmModal
      isOpen={props.isOpen}
      questionText={'Are you sure you wish to finalise? This will lock this '
                  + 'record permanently, and will cause any stock level changes '
                  + 'to take effect.'}
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
      onCancel={() => { if (props.onClose) props.onClose(); } }
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
