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
  const internalStyle = React.useMemo(
    () => ({
      flex,
      flexDirection: reverse ? 'row-reverse' : 'row',
      [alignItems ? 'alignItems' : undefined]: alignItems,
      [justifyContent ? 'justifyContent' : undefined]: justifyContent,
      ...style,
    }),
    [style, alignItems, justifyContent, flex]
  );
  return <View style={internalStyle}>{children}</View>;
};

FlexRow.defaultProps = {
  children: null,
  flex: 0,
  alignItems: '',
  justifyContent: '',
  style: {},
  reverse: false,
};

FlexRow.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  flex: PropTypes.number,
  alignItems: PropTypes.string,
  justifyContent: PropTypes.string,
  style: PropTypes.object,
  reverse: PropTypes.bool,
};
