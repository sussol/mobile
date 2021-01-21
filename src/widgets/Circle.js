/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import { TRANSPARENT } from '../globalStyles';

export const Circle = ({ size, children, backgroundColor, borderColor, elevate, style }) => {
  const adjustedStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    borderColor: borderColor ?? TRANSPARENT,
    elevation: elevate ? 5 : 0,
  };

  const internalStyle = [adjustedStyle, defaultStyle, style];

  return <View style={internalStyle}>{children}</View>;
};

const defaultStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderWidth: 1,
};

Circle.defaultProps = {
  size: 30,
  children: null,
  backgroundColor: TRANSPARENT,
  borderColor: TRANSPARENT,
  elevate: false,
  style: {},
};

Circle.propTypes = {
  style: PropTypes.object,
  size: PropTypes.number,
  children: PropTypes.node,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  elevate: PropTypes.bool,
};
