/* eslint-disable react/no-unused-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import { GREY } from '../globalStyles/index';

/**
 * Simple Separator display component rendering a line.
 *
 * @prop {Number} width            The width of the seperator
 * @prop {String} length           The length of the seperator as a percentage string.
 * @prop {Number} marginBottom     Number of pixels for the bottom margin.
 * @prop {Number} marginTop        Number of pixels for the bottom margin.
 * @prop {Number} marginHorizontal Number of pixels for the top & bottom margin.
 */
export const Seperator = props => {
  const { mainContainerStyle, borderContainerStyle } = localStyles(props);
  return (
    <View style={mainContainerStyle}>
      <View style={borderContainerStyle} />
    </View>
  );
};

Seperator.defaultProps = {
  width: 1,
  length: '100%',
  marginBottom: 5,
  marginTop: 0,
  marginHorizontal: 0,
};

Seperator.propTypes = {
  width: PropTypes.number,
  length: PropTypes.string,
  marginBottom: PropTypes.number,
  marginTop: PropTypes.number,
  marginHorizontal: PropTypes.number,
};

const localStyles = ({ width, length, marginBottom, marginTop, marginHorizontal }) => ({
  mainConatinerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal,
    marginBottom,
    marginTop,
  },
  borderContainerStyle: { width: length, borderBottomWidth: width, borderBottomColor: GREY },
});
