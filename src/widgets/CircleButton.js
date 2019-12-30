/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { SUSSOL_ORANGE } from '../globalStyles/index';

/**
 * Simple component rendering a button with a circular border radius
 * with an icon centered.
 *
 * @prop {Node} IconComponent An icon component to render in the center of the circle.
 * @prop {Func} onPress       OnPress callback.
 */
export const CircleButton = ({ IconComponent, onPress, onPressIn, onPressOut }) => (
  <TouchableOpacity
    onPressIn={onPressIn}
    onPressOut={onPressOut}
    onPress={onPress}
    style={localStyles.containerStyle}
  >
    <IconComponent />
  </TouchableOpacity>
);

CircleButton.defaultProps = {
  onPress: null,
  onPressIn: null,
  onPressOut: null,
};

CircleButton.propTypes = {
  IconComponent: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
};

const localStyles = StyleSheet.create({
  containerStyle: {
    borderRadius: 30,
    height: 30,
    width: 30,
    elevation: 5,
    borderColor: SUSSOL_ORANGE,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
  },
});
