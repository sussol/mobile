/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { SimpleLabel } from './SimpleLabel';

/**
 * Layout and display component rendering some text and a number
 * in a row.
 *
 * Simple wrapper around `SimpleLabel` component. See for further
 * detail.
 *
 * @prop {String} size   The font size - see SimpleLabel for details.
 * @prop {String} text   Left hand side text value.
 * @prop {Number} number Right hand side number value.
 */
export const NumberLabelRow = ({ size, text, number }) => (
  <View style={localStyles.mainContainer}>
    <View style={localStyles.flexNine}>
      <SimpleLabel text={text} size={size} />
    </View>
    <View style={localStyles.flexOne}>
      <SimpleLabel text={number} size={size} />
    </View>
  </View>
);

const localStyles = StyleSheet.create({
  mainContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  flexNine: { flex: 9 },
  flexOne: { flex: 1 },
});

NumberLabelRow.propTypes = {
  size: PropTypes.string,
  text: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
};

NumberLabelRow.defaultProps = { size: 'large' };
