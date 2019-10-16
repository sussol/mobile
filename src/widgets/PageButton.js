/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, ViewPropTypes } from 'react-native';
import { Button } from 'react-native-ui-components';

import globalStyles from '../globalStyles';

// A generic button for use on pages
export function PageButtonComponent(props) {
  const { style, textStyle, isDisabled, ...buttonProps } = props;

  const defaultButtonStyle = [globalStyles.button];
  if (isDisabled) defaultButtonStyle.push(globalStyles.disabledButton);
  const defaultTextStyle = [globalStyles.buttonText];
  if (isDisabled) defaultTextStyle.push(globalStyles.disabledButtonText);
  return (
    <Button
      isDisabled={isDisabled}
      style={[...defaultButtonStyle, localStyles.button, style]}
      textStyle={[...defaultTextStyle, textStyle]}
      {...buttonProps}
    />
  );
}

const propsAreEqual = (
  { isDisabled: prevIsDisabled, onPress: prevOnPress },
  { isDisabled: nextIsDisabled, onPress: nextOnPress }
) => {
  const isDisabledAreEqual = prevIsDisabled === nextIsDisabled;
  const onPressAreEqual = prevOnPress === nextOnPress;
  return isDisabledAreEqual && onPressAreEqual;
};

export const PageButton = React.memo(PageButtonComponent, propsAreEqual);

export default PageButton;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
PageButtonComponent.propTypes = {
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
