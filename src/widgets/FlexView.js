/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

/**
 * Simple layout component. For use when needing a simple View with flex.
 *
 * @param {React.node} children       Children of this component
 * @param {Number}     flex           The flex amount i.e. 1
 * @param {Object}     style          An additional styles object.
 */
export const FlexView = ({ children, flex, style, onLayout, alignItems, justifyContent }) => {
  const internalStyle = React.useMemo(
    () => ({
      flex,
      ...style,
      [alignItems ? 'alignItems' : undefined]: alignItems,
      [justifyContent ? 'justifyContent' : undefined]: justifyContent,
    }),
    [style, flex]
  );
  return (
    <View onLayout={onLayout} style={internalStyle}>
      {children}
    </View>
  );
};

FlexView.defaultProps = {
  children: null,
  flex: 1,
  style: {},
  onLayout: null,
  alignItems: '',
  justifyContent: '',
};

FlexView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  flex: PropTypes.number,
  style: PropTypes.object,
  onLayout: PropTypes.func,
  alignItems: PropTypes.string,
  justifyContent: PropTypes.string,
};
