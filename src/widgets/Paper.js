/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { WHITE } from '../globalStyles';

export const Paper = ({ width, height, style, children }) => {
  // If width and height are passed hard fix them in the container style,
  // let the axis which isn't passed flex. Plain width or height properties
  // sometimes act as suggestions when the container is flexing so use
  // max/min properties.
  const internalContainerStyle = { ...defaultStyle, ...style };
  if (width) {
    internalContainerStyle.maxWidth = width;
    internalContainerStyle.minWidth = width;
  }

  if (height) {
    internalContainerStyle.maxHeight = height;
    internalContainerStyle.minHeight = height;
  }
  console.log(internalContainerStyle);

  return <View style={internalContainerStyle}>{children}</View>;
};

const defaultStyle = {
  backgroundColor: WHITE,
  elevation: 2,
  borderRadius: 4,
  display: 'flex',
  flex: 1,
};

Paper.defaultProps = {
  width: 0,
  height: 0,
  style: { paddingHorizontal: 20 },
  children: null,
};

Paper.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
  children: PropTypes.node,
};
