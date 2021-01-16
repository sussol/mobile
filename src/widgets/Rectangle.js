import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import { DANGER_RED } from '../globalStyles';

const SIZES = {
  large: { width: 180, height: 60 },
};

export const Rectangle = ({ children, colour, size }) => {
  const dimensions = SIZES[size];
  const background = { backgroundColor: colour };
  const internalStyle = [containerStyle, dimensions, background];

  return <View style={internalStyle}>{children}</View>;
};

const containerStyle = {
  borderRadius: 5.33,
};

Rectangle.defaultProps = {
  children: null,
  colour: DANGER_RED,
  size: 'large',
};

Rectangle.propTypes = {
  children: PropTypes.node,
  colour: PropTypes.string,
  size: PropTypes.string,
};
