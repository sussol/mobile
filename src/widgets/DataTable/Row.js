/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { TouchableOpacity, View } from 'react-native';

/**
 * Renders a row of children as outputted by renderCells render prop
 * Tap gesture events will be captured in this component for any taps
 * on cells within this container which do not handle the event themselves.
 *
 * onFocus on a child will scroll the underlying list to this row.
 *
 * Passes two functions to cells to handle focusing the next editable
 * cell.
 * - `getRef(refIndex)` returns a reference to use in an editable cell.
 * - `focusNextCell(refIndex)` - focuses the next editable cell.
 *
 * refIndex: (RowIndex * NumberOfEditableCells) + EditableCellIndexInRow
 *
 * Example, where C = non editable, E = editable.
 * Row1: C C E C C E
 * Row2: C C E C C E
 * Row3: C C E C C E
 *
 * Last editable cell in Row 3 = 2 * 2 + 1
 * First editable cell in Row 2 = 1 * 2 + 0
 *
 * @param {object} rowData Data to pass to renderCells callback
 * @param {string|number} rowKey Unique key associated to row
 * @param {object} rowState State to pass to renderCells callBack
 * @param {func} onPress function to call on pressing the row.
 * @param {object} viewStyle Style object for the wrapping View component
 * @param {boolean} debug Set to `true` to console.log(`Row: ${rowKey}`)
 * @param {func}  getCellRef function passed from DataTable - see above.
 * @param {func}  adjustToTop function passed from DataTable, scrolling this row to the top.
 * @param {func}  focusNextCell function passed from DataTable - see above.
 * @param {number}  rowIndex  index of this row within DataTable.
 * @param {func} renderCells renderProp callBack for rendering cells based on rowData and rowState
 *                          `(rowKey, columnKey) => {...}`
 */
const Row = React.memo(
  ({
    rowData,
    rowState,
    rowKey,
    renderCells,
    style,
    onPress,
    debug,
    focusNextCell,
    rowIndex,
    getCellRef,
    adjustToTop,
  }) => {
    if (debug) {
      console.log('=================================');
      console.log(`Row: ${rowKey}`);
    }
    const Container = onPress ? TouchableOpacity : View;
    return (
      <Container
        onPress={onPress}
        style={style}
        onFocus={() => {
          adjustToTop(rowIndex);
        }}
      >
        {renderCells(rowData, rowState, rowKey, rowIndex, getCellRef, focusNextCell)}
      </Container>
    );
  }
);

Row.propTypes = {
  rowData: PropTypes.any.isRequired,
  rowState: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  renderCells: PropTypes.func.isRequired,
  style: PropTypes.object,
  onPress: PropTypes.func,
  debug: PropTypes.bool,
  focusNextCell: PropTypes.func,
  rowIndex: PropTypes.number.isRequired,
  getCellRef: PropTypes.func,
  adjustToTop: PropTypes.func,
};

Row.defaultProps = {
  rowState: null,
  style: {},
  onPress: null,
  debug: true,
  focusNextCell: null,
  getCellRef: null,
  adjustToTop: null,
};

export default Row;
