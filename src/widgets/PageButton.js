import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import { Button } from './Button';
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
      style={[...defaultButtonStyle, style]}
      textStyle={[...defaultTextStyle, textStyle]}
    />
  );
}

PageButton.propTypes = {
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
  onPress: React.PropTypes.func,
  text: React.PropTypes.string,
  isDisabled: React.PropTypes.bool,
};
