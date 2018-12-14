/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, BACKGROUND_COLOR } from '../../globalStyles';

/**
 * Designed to be used in conjunction with ReportTable.
 * @prop  {int}      key        Identifier - Ccll index within the row.
 * @prop  {bool}     even       Identifier for the row being even or odd within the FlatList.
 * @prop  {string}   children   Content to display.
 */
export const ReportCell = props => {
  backgroundColor = props.even ? 'white' : BACKGROUND_COLOR;
  containerStyle = StyleSheet.flatten([
    localStyles.container,
    { backgroundColor: backgroundColor },
  ]);
  return (
    <View style={containerStyle}>
      <Text style={localStyles.cell}>{props.children}</Text>
    </View>
  );
};

ReportCell.propTypes = {
  key: PropTypes.number.isRequired,
  even: PropTypes.bool,
  children: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: '2%',
    marginRight: 1,
  },
  cell: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
});

ReportCell.propTypes = {
  even: PropTypes.bool.isRequired,
};
