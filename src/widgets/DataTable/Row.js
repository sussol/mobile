/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';

/**
 * Renders a row of children as outputted by renderCells render prop
 *
 * @param {object} rowData Data to pass to renderCells callback
 * @param {string|number} rowKey Unique key associated to row
 * @param {object} rowState State to pass to renderCells callBack
 * @param {func} renderCells renderProp callBack for rendering cells based on rowData and rowState
 *                          `(rowKey, columnKey) => {...}`
 */
const Row = React.memo(({ rowData, rowState, rowKey, renderCells }) => {
  console.log('=================================');
  console.log(`Row: ${rowKey}`);
  return <View style={defaultStyles.row}>{renderCells(rowData, rowState, rowKey)}</View>;
});

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

export default Row;
