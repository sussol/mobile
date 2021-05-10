/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, StyleSheet } from 'react-native';

import globalStyles, { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../../globalStyles/index';
import { authStrings } from '../../localization/index';

export const FormPasswordInput = ({
  isEditable,
  onChangeText,
  onSubmitEditing,
  passwordTextStyle,
  placeholder,
  placeholderTextColor,
  returnKeyType,
  style,
  underlineColorAndroid,
  value,
}) => (
  // Workaround for Bug in RN 0.64 updating secureTextEntry TextInput style to some kind of
  // monospaced default
  <TextInput
    autoCompleteType="password"
    editable={isEditable}
    onChangeText={onChangeText}
    onSubmitEditing={onSubmitEditing}
    placeholder={placeholder}
    placeholderTextColor={placeholderTextColor}
    ref={reference => reference && reference.setNativeProps({ style: passwordTextStyle })}
    returnKeyType={returnKeyType}
    style={style}
    underlineColorAndroid={underlineColorAndroid}
    value={value}
    secureTextEntry
    selectTextOnFocus
  />
);

const localStyles = StyleSheet.create({
  textStyle: { fontFamily: APP_FONT_FAMILY },
});

FormPasswordInput.defaultProps = {
  isEditable: true,
  placeholder: authStrings.password,
  placeholderTextColor: SUSSOL_ORANGE,
  passwordTextStyle: localStyles.textStyle,
  returnKeyType: 'done',
  style: globalStyles.authFormTextInputStyle,
  underlineColorAndroid: SUSSOL_ORANGE,
  value: '',
};

FormPasswordInput.propTypes = {
  isEditable: PropTypes.bool,
  onChangeText: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  passwordTextStyle: PropTypes.object,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  returnKeyType: PropTypes.string,
  style: PropTypes.object,
  underlineColorAndroid: PropTypes.string,
  value: PropTypes.string,
};
