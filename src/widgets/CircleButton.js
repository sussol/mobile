/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
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
 * @prop {Func} onPress       OnPress callback.
 */
export const CircleButton = ({
  IconComponent,
  onPress,
  onPressIn,
  onPressOut,
  isDisabled,
  size,
}) => {
  const styles = React.useMemo(() => localStyles(size), [size]);

  const Container = isDisabled ? View : TouchableOpacity;

  const containerStyle = [styles.dimensions, styles.containerStyle];
  const internalStyle = isDisabled ? [containerStyle, styles.disabledStyle] : containerStyle;

  return (
    <Container
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={internalStyle}
    >
      <IconComponent size={ICON_SIZE_VALUES[size]} />
    </Container>
  );
};

CircleButton.defaultProps = {
  onPress: null,
  onPressIn: null,
  onPressOut: null,
  isDisabled: false,
  size: 'large',
};

CircleButton.propTypes = {
  IconComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  isDisabled: PropTypes.bool,
  size: PropTypes.string,
};

const localStyles = size =>
  StyleSheet.create({
    dimensions: {
      width: SIZE_VALUES[size],
      height: SIZE_VALUES[size],
      borderRadius: SIZE_VALUES[size],
    },
    disabledStyle: {
      backgroundColor: LIGHT_GREY,
      borderColor: LIGHT_GREY,
    },
    containerStyle: {
      elevation: 5,
      borderColor: SUSSOL_ORANGE,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: SUSSOL_ORANGE,
    },
  });
