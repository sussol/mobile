/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { FlexView } from '../FlexView';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../globalStyles';
import { formInputStrings } from '../../localization';

export const FormLabel = ({ isRequired, value, textStyle, isRequiredStyle }) => (
  <FlexView flex={1} justifyContent="center">
    <Text style={textStyle}>{value}</Text>
    {(isRequired && <Text style={isRequiredStyle}>{formInputStrings.is_required}</Text>) || null}
  </FlexView>
);

const localStyles = StyleSheet.create({
  textStyle: {
    fontSize: APP_GENERAL_FONT_SIZE,
    fontFamily: APP_FONT_FAMILY,
  },
  isRequiredStyle: { fontSize: 12, color: SUSSOL_ORANGE, fontFamily: APP_FONT_FAMILY },
});

FormLabel.defaultProps = {
  textStyle: localStyles.textStyle,
  isRequiredStyle: localStyles.isRequiredStyle,
  isRequired: false,
};

FormLabel.propTypes = {
  value: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  textStyle: PropTypes.object,
  isRequiredStyle: PropTypes.object,
};
