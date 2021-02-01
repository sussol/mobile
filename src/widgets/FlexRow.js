/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

/**
 * Simple layout component. For use when needing a simple View with flex
 * direction of row.
 * @param {React.node} children       Children of this component
 * @param {Number}     flex           The flex amount i.e. 1
 * @param {String}     alignItems     The alignItems style value
 * @param {String}     justifyContent The justifyContent style value
 * @param {Object}     style          An additional styles object.
 * @param {Bool}       reverse        Indicator to use row-reverse. Defaults to false.
 */
export const FlexRow = ({ children, flex, alignItems, justifyContent, style, reverse }) => {
  const proppedStyles = {
    flex,
    alignItems,
    justifyContent,
    flexDirection: reverse ? 'row-reverse' : 'row',
  };

  return <View style={[proppedStyles, style]}>{children}</View>;
};

FlexRow.defaultProps = {
  children: null,
  flex: 0,
  alignItems: null,
  justifyContent: null,
  style: {},
  reverse: false,
};

FlexRow.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  flex: PropTypes.number,
  alignItems: PropTypes.string,
  justifyContent: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  reverse: PropTypes.bool,
};
