/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableOpacity as TouchableHighlight, StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import globalStyles, { SUSSOL_ORANGE, LIGHT_GREY, GREY } from '../globalStyles/index';

const ICON_SIZES = {
  small: 10,
  medium: 15,
  large: 20,
};

/**
 * Simple component rendering a button with a circular border radius
 * with an icon centered.
 *
 * @prop {Node} IconComponent An icon component to render in the center of the circle.
 * @prop {Func} onPress OnPress callback.
 * @prop {Func} onPressIn onPressIn callback.
 * @prop {Func} onPressOut  onPressOut callback.
 * @prop {Boolean} isDisabled  When true, no action on press. Disabled styling too.
 * @prop {String} size  Use size preset. "small", "medium" or "large".
 * @prop {String} leftText  Button label text to left of icon.
 * @prop {String} rightText Button label text to right of icon
 */
export const IconButton = ({
  IconComponent,
  onPress,
  onPressIn,
  onPressOut,
  isDisabled,
  size,
  leftText,
  rightText,
}) => {
  const labelStyle = [localStyles.label, globalStyles.authWindowButtonText];
  const Container = isDisabled ? View : TouchableHighlight;
  const iconSize = ICON_SIZES[size];

  return (
    <Container
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={localStyles.buttonContainer}
    >
      {leftText && <Text style={labelStyle}>{leftText}</Text>}
      <IconComponent color={GREY} size={iconSize} />
      {rightText && <Text style={labelStyle}>{rightText}</Text>}
    </Container>
  );
};

IconButton.defaultProps = {
  onPress: null,
  onPressIn: null,
  onPressOut: null,
  isDisabled: false,
  size: 'large',
  leftText: null,
  rightText: null,
};

IconButton.propTypes = {
  IconComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  isDisabled: PropTypes.bool,
  size: PropTypes.string,
  leftText: PropTypes.string,
  rightText: PropTypes.string,
};

const localStyles = StyleSheet.create({
  label: {
    paddingHorizontal: 5,
  },
  iconDisabledStyle: {
    backgroundColor: LIGHT_GREY,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: SUSSOL_ORANGE,
  },
});
