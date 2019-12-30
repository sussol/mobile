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
 */
export const FlexRow = ({ children, flex, alignItems, justifyContent, style }) => {
  const internalStyle = React.useMemo(
    () => ({
      flex,
      flexDirection: 'row',
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
};

FlexRow.propTypes = {
  children: PropTypes.oneOf([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  flex: PropTypes.number,
  alignItems: PropTypes.string,
  justifyContent: PropTypes.string,
  style: PropTypes.object,
};
