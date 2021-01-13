/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { SUSSOL_ORANGE, LIGHT_GREY } from '../globalStyles/index';

const SIZE_VALUES = {
  small: 15,
  medium: 22,
  large: 30,
};

const ICON_SIZE_VALUES = {
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
  textStyle,
  onPress,
  onPressIn,
  onPressOut,
  isDisabled,
  size,
  leftText,
  rightText,
}) => {
  const styles = React.useMemo(() => localStyles(size), [size]);
  const labelStyle = [styles.label, textStyle];
  const Container = isDisabled ? View : TouchableOpacity;
  const iconContainerStyle = [
    styles.dimensions,
    styles.container,
    isDisabled && styles.iconDisabledStyle,
  ];

  return (
    <Container
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={styles.buttonContainer}
    >
      {leftText && <Text style={labelStyle}>{leftText}</Text>}
      <View style={iconContainerStyle}>
        <IconComponent size={ICON_SIZE_VALUES[size]} />
      </View>
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
  textStyle: null,
};

IconButton.propTypes = {
  IconComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  textStyle: PropTypes.any,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  isDisabled: PropTypes.bool,
  size: PropTypes.string,
  leftText: PropTypes.string,
  rightText: PropTypes.string,
};

const localStyles = size =>
  StyleSheet.create({
    label: {
      paddingHorizontal: 5,
    },
    dimensions: {
      width: SIZE_VALUES[size],
      height: SIZE_VALUES[size],
      borderRadius: SIZE_VALUES[size],
    },
    iconDisabledStyle: {
      backgroundColor: LIGHT_GREY,
      borderColor: LIGHT_GREY,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      borderColor: 'red',
      borderWidth: 1,
      alignItems: 'center',
    },
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: SUSSOL_ORANGE,
    },
  });
