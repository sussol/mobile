/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ReportCell } from './ReportCell';

export const ReportRow = ({ isHeader, rowData, rowIndex }) => {
  const headerStyle = isHeader ? localStyles.header : null;
  const rowStyle = StyleSheet.flatten([localStyles.container, headerStyle]);
  const cellsToRender = rowData.map(cell => (
    <ReportCell key={rowIndex} even={rowIndex % 2 === 0}>
      {cell}
    </ReportCell>
  ));

  return <View style={rowStyle}>{cellsToRender}</View>;
};

const localStyles = StyleSheet.create({
  header: {
    marginBottom: 1,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    height: 50,
  },
});

ReportRow.propTypes = {
  isHeader: PropTypes.bool.isRequired,
  rowData: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
};
