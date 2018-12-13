/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReportCell } from './ReportCell';
import PropTypes from 'prop-types';

/**
 * Designed to be used in conjunction with ReportTable.
 * @prop  {array}   rowData   Array of strings to be rendered as the content of each cell.
 * @prop  {int}     index     Index of the row within the FlatList.
 * @prop  {bool}    isHeader    Indicating if this row is a header row.
 */

export const ReportRow = props => {
  const headerStyle = props.isHeader ? { marginBottom: 1 } : null;
  const cellsToRender = props.rowData.map((cell, index) => {
    return (
      <ReportCell key={index} even={props.index % 2 === 0}>
        {cell}
      </ReportCell>
    );
  });
  return <View style={[localStyles.container, headerStyle]}>{cellsToRender}</View>;
};

const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    height: 50,
  },
});

ReportRow.propTypes = {
  rowData: PropTypes.array.isRequired,
  isHeader: PropTypes.bool,
  index: PropTypes.number.isRequired,
};
