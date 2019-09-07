/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, VirtualizedList, VirtualizedListPropTypes } from 'react-native';

/**
 * Base DataTable component. Thin wrapper around VirtualizedList, providing
 * a header component. All VirtualizedList props can be passed through,
 * however renderItem is renamed renderRow.
 *
 * Managing focus and scrolling:
 * Can manage focusing and auto-scrolling for editable cells.
 * Three parameters are passed in `renderRow`:
 * - `getCellRef`  : lazily creates a ref for a cell.
 * - `focusNext`   : Focus' the next editable cell. Call during onEditingSubmit.
 * - `adjustToTop` : Scrolls so the focused row is at the top of the list.
 *
 * @param {Func}   renderRow    Renaming of VirtualizedList renderItem prop.
 * @param {Func}   renderHeader Function which should return a header component
 */
const DataTable = React.memo(
  ({ renderRow, renderHeader, style, data, numberEditableColumns = 1, ...otherProps }) => {
    const numberOfEditableCells = data.length * numberEditableColumns;

    // Create an array for each editable cell ref.
    const refs = Array.from({ length: numberOfEditableCells });

    // Reference to the virtualized list for scroll operations.
    const virtualizedListRef = React.createRef();

    // Callback passed to cells which will create a ref if there isn't already one,
    // and pass back the reference for the cell position.
    const getCellRef = refIndex => {
      if (refs[refIndex]) return refs[refIndex];
      const newRef = React.createRef(refIndex);
      refs[refIndex] = newRef;
      return newRef;
    };

    // Focuses the next editable cell in the list. Back to the top on last row.
    const focusNext = refIndex => {
      // Cell ref of the next editable cell, or the first if the last is passed.s
      const cellRef = getCellRef((refIndex + 1) % numberOfEditableCells);
      cellRef.current.focus();
    };

    // Adjusts the passed row to the top of the list.
    const adjustToTop = rowIndex => {
      virtualizedListRef.current.scrollToIndex({ index: rowIndex });
    };

    return (
      <>
        {renderHeader()}
        <VirtualizedList
          ref={virtualizedListRef}
          keyboardDismissMode="none"
          data={data}
          keyboardShouldPersistTaps="always"
          style={style}
          disableVirtualization={true}
          renderItem={rowItem => renderRow(rowItem, focusNext, getCellRef, adjustToTop)}
          {...otherProps}
        />
      </>
    );
  }
);

const defaultStyles = StyleSheet.create({
  virtualizedList: {
    flex: 1,
  },
});

DataTable.propTypes = {
  ...VirtualizedListPropTypes,
  renderRow: PropTypes.func.isRequired,
  renderHeader: PropTypes.func,
  getItem: PropTypes.func,
  getItemCount: PropTypes.func,
  initialNumToRender: PropTypes.number,
  removeClippedSubviews: PropTypes.bool,
  windowSize: PropTypes.number,
  style: PropTypes.object,
  numberEditableColumns: PropTypes.number,
};

DataTable.defaultProps = {
  renderHeader: null,
  style: defaultStyles.virtualizedList,
  getItem: (items, index) => items[index],
  getItemCount: items => items.length,
  initialNumToRender: 20,
  removeClippedSubviews: true,
  windowSize: 1,
  numberEditableColumns: 1,
};

export default DataTable;
