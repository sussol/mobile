/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';

const Row = ({ rowData, rowState, rowKey, renderCells }) => {
  console.log('=================================');
  console.log(`Row: ${rowKey}`);
  console.log('=================================');
  return <View style={defaultStyles.row}>{renderCells(rowData, rowState, rowKey)}</View>;
};

Row.propTypes = {
  rowData: PropTypes.any.isRequired,
  rowState: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  renderCells: PropTypes.func.isRequired,
};

Row.defaultProps = {
  rowState: null,
};

const defaultStyles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

Row.whyDidYouRender = true;

export default React.memo(Row, (prevProps, nextProps) => {
  const { rowData, rowState, rowKey, renderCells } = prevProps;
  const {
    rowData: nextRowData,
    rowState: nextRowState,
    rowKey: nextRowKey,
    renderCells: nextRenderCells,
  } = nextProps;

  console.log('=================================');
  console.log('rowdata', rowData === nextRowData);
  console.log('rowState', rowState === nextRowState);
  console.log('rowKey', rowKey === nextRowKey);
  console.log('renderCells', renderCells === nextRenderCells);
  console.log('=================================');

  return false;
});
