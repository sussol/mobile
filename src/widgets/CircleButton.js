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
export const CircleButton = ({ IconComponent, onPress }) => (
  <TouchableOpacity onPress={onPress} style={localStyles.containerStyle}>
    <IconComponent />
  </TouchableOpacity>
);

CircleButton.propTypes = {
  IconComponent: PropTypes.node.isRequired,
  onPress: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  containerStyle: {
    borderRadius: 30,
    height: 30,
    width: 30,
    borderColor: SUSSOL_ORANGE,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
  },
});
