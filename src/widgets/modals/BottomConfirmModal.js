/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Text, StyleSheet, ViewPropTypes } from 'react-native';

import { OnePressButton } from '../OnePressButton';
import { BottomModal } from './BottomModal';
import { modalStrings } from '../../localization';

import globalStyles, { SUSSOL_ORANGE } from '../../globalStyles';

export const BottomConfirmModalComponent = props => {
  const {
    onCancel,
    onConfirm,
    questionText,
    confirmText,
    cancelText,
    style,
    ...modalProps
  } = props;

  return (
    <BottomModal {...modalProps} style={[localStyles.modal, style]}>
      <Text style={[globalStyles.text, localStyles.questionText]}>{questionText}</Text>
      <OnePressButton
        style={[globalStyles.button, localStyles.cancelButton]}
        textStyle={[globalStyles.buttonText, localStyles.buttonText]}
        text={cancelText}
        onPress={onCancel}
      />
      <OnePressButton
        style={[globalStyles.button, localStyles.deleteButton]}
        textStyle={[globalStyles.buttonText, localStyles.buttonText]}
        text={confirmText}
        onPress={onConfirm}
      />
    </BottomModal>
  );
};

/**
 * Only re-render this component when isOpen prop changes.
 */
const propsAreEqual = ({ isOpen: prevIsOpen }, { isOpen: nextIsOpen }) => prevIsOpen === nextIsOpen;

export const BottomConfirmModal = React.memo(BottomConfirmModalComponent, propsAreEqual);

export default BottomConfirmModal;

BottomConfirmModalComponent.propTypes = {
  style: ViewPropTypes.style,
  isOpen: PropTypes.bool.isRequired,
  questionText: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
};
BottomConfirmModalComponent.defaultProps = {
  style: {},
  cancelText: modalStrings.cancel,
  confirmText: modalStrings.confirm,
};

const localStyles = StyleSheet.create({
  modal: {
    paddingRight: 3,
  },
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
