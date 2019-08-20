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
 * @param {Func}   renderRow    renaming of virtualizedList renderItem prop.
 * @param {Func}   renderHeader Function which should return a header component
 */
const DataTable = React.memo(({ renderRow, renderHeader, style, ...otherProps }) => (
  <>
    {renderHeader()}
    <VirtualizedList style={style} renderItem={renderRow} {...otherProps} />
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
  style: PropTypes.object,
};

DataTable.defaultProps = {
  getItem: (items, index) => items[index],
  getItemCount: items => items.length,
  renderHeader: null,
  style: defaultStyles.virtualizedList,
};

export default DataTable;
