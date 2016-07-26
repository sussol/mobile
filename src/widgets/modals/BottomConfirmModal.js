/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Button } from '../Button';
import { BottomModal } from './BottomModal';
import globalStyles, { SUSSOL_ORANGE } from '../../globalStyles';

export function BottomConfirmModal(props) {
  const { onCancel, onConfirm, questionText, confirmText, cancelText, ...modalProps } = props;
  return (
    <BottomModal {...modalProps}>
      <Text style={[globalStyles.text, localStyles.questionText]}>
        {questionText}
      </Text>
      <Button
        style={[globalStyles.button, localStyles.cancelButton]}
        textStyle={[globalStyles.buttonText, localStyles.buttonText]}
        text={cancelText}
        onPress={onCancel}
      />
      <Button
        style={[globalStyles.button, localStyles.deleteButton]}
        textStyle={[globalStyles.buttonText, localStyles.buttonText]}
        text={confirmText}
        loadingText={'Confirming...'}
        onPress={onConfirm}
      />
    </BottomModal>
   );
}

BottomConfirmModal.propTypes = {
  style: View.propTypes.style,
  isOpen: React.PropTypes.bool.isRequired,
  questionText: React.PropTypes.string.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
  cancelText: React.PropTypes.string,
  confirmText: React.PropTypes.string,
};
BottomConfirmModal.defaultProps = {
  style: {},
  cancelText: 'Cancel',
  confirmText: 'Confirm',
};

const localStyles = StyleSheet.create({
  questionText: {
    color: 'white',
    fontSize: 22,
    paddingRight: 10,
  },
  buttonText: {
    color: 'white',
  },
  cancelButton: {
    borderColor: 'white',
  },
  deleteButton: {
    borderColor: 'white',
    backgroundColor: SUSSOL_ORANGE,
  },
});
