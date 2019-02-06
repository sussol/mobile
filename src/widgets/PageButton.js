/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, ViewPropTypes } from 'react-native';
import { Button } from 'react-native-ui-components';

import globalStyles from '../globalStyles';

// A generic button for use on pages
export function PageButton(props) {
  const { style, textStyle, isDisabled, ...buttonProps } = props;

  const defaultButtonStyle = [globalStyles.button];
  if (isDisabled) defaultButtonStyle.push(globalStyles.disabledButton);
  const defaultTextStyle = [globalStyles.buttonText];
  if (isDisabled) defaultTextStyle.push(globalStyles.disabledButtonText);
  return (
    <Button
      {...buttonProps}
      style={[...defaultButtonStyle, localStyles.button, style]}
      textStyle={[...defaultTextStyle, textStyle]}
    />
  );
}

export default PageButton;

PageButton.propTypes = {
  // eslint-disable-next-line react/require-default-props
  style: ViewPropTypes.style,
  // eslint-disable-next-line react/require-default-props
  textStyle: Text.propTypes.style,
  // eslint-disable-next-line react/require-default-props
  onPress: PropTypes.func,
  // eslint-disable-next-line react/require-default-props
  text: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  isDisabled: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  button: {
    margin: 0,
  },
});
