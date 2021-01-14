/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableOpacity as TouchableHighlight, StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import globalStyles, { GREY } from '../globalStyles/index';

const ICON_SIZES = {
  small: 10,
  medium: 15,
  large: 20,
  xlarge: 30,
};

/**
 * Simple component rendering a button with an icon, and option text label on the right side
 *
 * @prop {Node} IconComponent An icon component to render in the center of the circle.
 * @prop {Func} onPress OnPress callback.
 * @prop {Func} onPressIn onPressIn callback.
 * @prop {Func} onPressOut  onPressOut callback.
 * @prop {Boolean} containerStyle  When true, no action on press. Disabled styling too.
 * @prop {Boolean} isDisabled  When true, no action on press. Disabled styling too.
 * @prop {String} color  Color for the icon component
 * @prop {String} size  Use size preset. "small", "medium", "large" or xlarge.
 * @prop {String} label Button label text to right of icon
 */
export const IconButton = ({
  IconComponent,
  onPress,
  onPressIn,
  onPressOut,
  containerStyle,
  isDisabled,
  color,
  size,
  label,
}) => {
  const labelStyle = [localStyles.label, globalStyles.authWindowButtonText];
  const buttonContainerStyle = [localStyles.buttonContainer, containerStyle];
  const Container = isDisabled ? View : TouchableHighlight;
  const iconSize = ICON_SIZES[size];

  return (
    <Container
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={buttonContainerStyle}
    >
      <IconComponent color={color} size={iconSize} />
      {label && <Text style={labelStyle}>{label}</Text>}
    </Container>
  );
};

IconButton.defaultProps = {
  onPress: null,
  onPressIn: null,
  onPressOut: null,
  containerStyle: null,
  isDisabled: false,
  color: GREY,
  size: 'large',
  label: null,
};

IconButton.propTypes = {
  IconComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  containerStyle: PropTypes.object,
  isDisabled: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.string,
  label: PropTypes.string,
};

const localStyles = StyleSheet.create({
  label: {
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
