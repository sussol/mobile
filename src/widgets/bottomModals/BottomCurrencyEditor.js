/* eslint-disable import/prefer-default-export */
import React from 'react';
import { PropTypes } from 'prop-types';
import { TextInput, StyleSheet } from 'react-native';

import { BottomModalContainer } from './BottomModalContainer';
import { OnePressButton } from '../OnePressButton';
import globalStyles from '../../globalStyles';

const {
  modalTextInput,
  modalText,
  modalButtonText,
  modalOrangeButton,
  button,
  buttonText: buttonTextStyle,
} = globalStyles;

export const BottomCurrencyEditor = React.memo(
  ({ isOpen, placeholder, value, buttonText, onChangeText, onConfirm }) => (
    <BottomModalContainer isOpen={isOpen} style={localStyles.modalStyle}>
      <TextInput
        style={localStyles.textInputStyle}
        underlineColorAndroid="white"
        placeholderTextColor="white"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onConfirm}
        keyboardType="number-pad"
      />
      <OnePressButton
        style={localStyles.buttonStyle}
        textStyle={localStyles.textStyle}
        text={buttonText}
        onPress={onConfirm}
      />
    </BottomModalContainer>
  )
);

const localStyles = StyleSheet.create({
  textInputStyle: { ...modalTextInput, ...modalText },
  buttonStyle: { ...button, ...modalOrangeButton },
  textStyle: { ...buttonTextStyle, ...modalButtonText },
  modalStyle: {
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
});

BottomCurrencyEditor.defaultProps = {
  placeholder: '',
  value: '',
};
BottomCurrencyEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
