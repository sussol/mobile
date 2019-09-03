/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { TouchableOpacity, View } from 'react-native';

/**
 * Renders a row of children as outputted by renderCells render prop
 * Tap gesture events will be captured in this component for any taps
 * on cells within this container.
 *
 * @param {object} rowData Data to pass to renderCells callback
 * @param {string|number} rowKey Unique key associated to row
 * @param {object} rowState State to pass to renderCells callBack
 * @param {func} onPress function to call on pressing the row.
 * @param {object} viewStyle Style object for the wrapping View component
 * @param {boolean} debug Set to `true` to console.log(`Row: ${rowKey}`)
 * @param {func} renderCells renderProp callBack for rendering cells based on rowData and rowState
 *                          `(rowKey, columnKey) => {...}`
 */
const Row = React.memo(({ rowData, rowState, rowKey, renderCells, style, onPress, debug }) => {
  if (debug) {
    console.log('=================================');
    console.log(`Row: ${rowKey}`);
  }
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container onPress={onPress} style={style}>
      {renderCells(rowData, rowState, rowKey)}
    </Container>
  );
});

Row.propTypes = {
  rowData: PropTypes.any.isRequired,
  rowState: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  renderCells: PropTypes.func.isRequired,
  style: PropTypes.object,
  onPress: PropTypes.func,
  debug: PropTypes.bool,
};

Row.defaultProps = {
  rowState: null,
  style: {},
  onPress: null,
  debug: false,
};

export default Row;
