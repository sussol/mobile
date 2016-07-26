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
  Dimensions,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard'; // eslint-disable-line import/no-unresolved
import { Button } from '../Button';
import Modal from 'react-native-modalbox';
import globalStyles from '../../globalStyles';

export function ConfirmModal(props) {
  if (props.isOpen) dismissKeyboard();
  const { style, textStyle, onCancel, onConfirm, questionText, ...modalProps } = props;
  return (
    <Modal
      {...modalProps}
      style={[defaultStyles.modal, style]}
    >
      <Text style={textStyle}>
        {questionText}
      </Text>
      <View style={[defaultStyles.buttonContainer, props.buttonContainerStyle]}>
        {onCancel && <Button
          style={[globalStyles.button, props.cancelButtonStyle]}
          textStyle={[globalStyles.buttonText, props.buttonTextStyle]}
          text={props.cancelText}
          onPress={onCancel}
        />}
        {onConfirm && <Button
          style={[globalStyles.button, props.confirmButtonStyle]}
          textStyle={[globalStyles.buttonText, props.buttonTextStyle]}
          text={props.confirmText}
          loadingText={'Confirming...'}
          onPress={onConfirm}
        />}
      </View>
    </Modal>
   );
}

ConfirmModal.propTypes = {
  style: View.propTypes.style,
  buttonContainerStyle: View.propTypes.style,
  buttonTextStyle: Text.propTypes.style,
  cancelButtonStyle: View.propTypes.style,
  cancelText: React.PropTypes.string,
  confirmButtonStyle: View.propTypes.style,
  confirmText: React.PropTypes.string,
  textStyle: Text.propTypes.style,
  isOpen: React.PropTypes.bool.isRequired,
  questionText: React.PropTypes.string.isRequired,
  onCancel: React.PropTypes.func,
  onConfirm: React.PropTypes.func,
};
ConfirmModal.defaultProps = {
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  style: {},
  globalStyles: {},
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
};

const defaultStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 50,
  },
  modal: {
    height: (Dimensions.get('window').height) / 3,
  },
});
