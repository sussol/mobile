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
 * @param {Func}   renderRow    Renaming of VirtualizedList renderItem prop.
 * @param {Func}   renderHeader Function which should return a header component
 */
const DataTable = React.memo(({ renderRow, renderHeader, style, ...otherProps }) => (
  <>
    {renderHeader()}
    <VirtualizedList
      keyboardShouldPersistTaps="always"
      style={style}
      renderItem={renderRow}
      {...otherProps}
    />
  </>
));

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
};

DataTable.defaultProps = {
  renderHeader: null,
  style: defaultStyles.virtualizedList,
  getItem: (items, index) => items[index],
  getItemCount: items => items.length,
  initialNumToRender: 20,
  removeClippedSubviews: true,
  windowSize: 11,
};

export default DataTable;
