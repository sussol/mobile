/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';

import { WHITE } from '../globalStyles';

export const Paper = ({ width, height, children, style }) => {
  // If width and height are passed hard fix them in the container style,
  // let the axis which isn't passed flex. Plain width or height properties
  // sometimes act as suggestions when the container is flexing so use
  // max/min properties.
  let internalContainerStyle = [localStyles.container, style];
  if (width) internalContainerStyle = [localStyles.container, { width }];
  if (height) internalContainerStyle = [localStyles.container, { height }];

  return <View style={internalContainerStyle}>{children}</View>;
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    elevation: 2,
    borderRadius: 4,
    paddingHorizontal: 20,
    flex: 1,
  },
});

Paper.defaultProps = {
  width: null,
  height: null,
  style: {},
  children: null,
};

Paper.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
  children: PropTypes.node,
};
