/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, BACKGROUND_COLOR } from '../../globalStyles';

/**
 * This page renders the incoming cell data of a Table report
 * *
 * @prop  {boolean}   even       Indicates if the cell index is even or odd to select the bkg color
 * @prop  {string}    children   Data to show on the cell
 */

export const ReportCell = ({ even, children }) => {
  const backgroundColor = even ? { backgroundColor: 'white' } : null;
  return (
    <View style={[localStyles.container, backgroundColor]}>
      <Text style={localStyles.cell}>{children}</Text>
    </View>
  );
};

ReportCell.propTypes = {
  even: PropTypes.bool,
  children: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: '2%',
    marginRight: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  cell: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
});

ReportCell.propTypes = {
  even: PropTypes.bool.isRequired,
};
