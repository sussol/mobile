/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, VirtualizedList, VirtualizedListPropTypes } from 'react-native';

const DataTable = React.memo(({ renderRow, renderHeader, ...otherProps }) => (
  <>
    {renderHeader()}
    <VirtualizedList style={defaultStyles.virtualizedList} renderItem={renderRow} {...otherProps} />
  </>
));

DataTable.propTypes = {
  ...VirtualizedListPropTypes,
  renderRow: PropTypes.func.isRequired,
  renderHeader: PropTypes.func,
  getItem: PropTypes.func,
  getItemCount: PropTypes.func,
};

DataTable.defaultProps = {
  getItem: (items, index) => items[index],
  getItemCount: items => items.length,
  renderHeader: null,
};

const defaultStyles = StyleSheet.create({
  virtualizedList: {
    flex: 1,
  },
});

export default DataTable;
