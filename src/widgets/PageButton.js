/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  ViewPropTypes,
} from 'react-native';

import { Button } from 'react-native-ui-components';
import globalStyles from '../globalStyles';

// A generic button for use on pages
export function PageButton(props) {
  const { style, textStyle, ...buttonProps } = props;

  const defaultButtonStyle = [globalStyles.button];
  if (props.isDisabled) defaultButtonStyle.push(globalStyles.disabledButton);
  const defaultTextStyle = [globalStyles.buttonText];
  if (props.isDisabled) defaultTextStyle.push(globalStyles.disabledButtonText);
  return (
    <Button
      {...buttonProps}
      style={[...defaultButtonStyle, localStyles.button, style]}
      textStyle={[...defaultTextStyle, textStyle]}
    />
  );
}

PageButton.propTypes = {
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  onPress: PropTypes.func,
  text: PropTypes.string,
  isDisabled: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  button: {
    margin: 0,
  },
});
