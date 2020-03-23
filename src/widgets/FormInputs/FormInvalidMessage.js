/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { FINALISED_RED, APP_FONT_FAMILY } from '../../globalStyles';

export const FormInvalidMessage = ({ isValid, message, textStyle }) =>
  isValid ? null : <Text style={textStyle}>{message}</Text>;

const localStyles = StyleSheet.create({
  textStyle: { color: FINALISED_RED, fontFamily: APP_FONT_FAMILY },
});

FormInvalidMessage.defaultProps = {
  message: '',
  textStyle: localStyles.textStyle,
};

FormInvalidMessage.propTypes = {
  isValid: PropTypes.bool.isRequired,
  message: PropTypes.string,
  textStyle: PropTypes.object,
};
