import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

export const WithFixedDimensions = ({ width, height, children }) => {
  // Only use a style if passed as a prop, otherwise ignore it.
  // Passing no width or height results in no change to children.
  const internalStyle = {};
  if (width) internalStyle.width = width;
  if (height) internalStyle.height = height;

  return <View style={internalStyle}>{children}</View>;
};

WithFixedDimensions.defaultProps = { width: 0, height: 0, children: null };

WithFixedDimensions.propTypes = {
  children: PropTypes.node,
  width: PropTypes.number,
  height: PropTypes.number,
};
