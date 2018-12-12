/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReportCell } from './ReportCell';
import PropTypes from 'prop-types';

export const ReportRow = props => {
  const headerStyle = props.header ? { marginBottom: 1 } : null;
  const elements = props.rowData.map((cell, index) => {
    return (
      <ReportCell key={index} even={props.index % 2 === 0}>
        {cell}
      </ReportCell>
    );
  });
  return <View style={[localStyles.container, headerStyle]}>{elements}</View>;
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
  header: PropTypes.bool,
};
