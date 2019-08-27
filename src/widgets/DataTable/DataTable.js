/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { StyleSheet, VirtualizedList, VirtualizedListPropTypes } from 'react-native';

/**
 * Base DataTable component. Thin wrapper around VirtualizedList, providing
 * a header component. All VirtualizedList props can be passed through,
 * however renderItem is renamed renderRow.
 *
 * @param {Func}   renderRow    Renaming of VirtualizedList renderItem prop.
 * @param {Func}   renderHeader Function which should return a header component
 */
let renderCount = 0;
let totalTime = 0;
const DataTable = React.memo(({ renderRow, renderHeader, style, ...otherProps }) => {
  const start = Date.now();
  useEffect(() => {
    if (renderCount === 20) {
      console.log('===========================================');
      console.log(`${renderCount} render avg time: ${totalTime / renderCount}ms`);
      console.log('===========================================');
      renderCount += 1;
    } else {
      totalTime += Date.now() - start;
      renderCount += 1;
    }
  }, []);
  return (
    <>
      {renderHeader()}
      <VirtualizedList style={style} renderItem={renderRow} {...otherProps} />
    </>
  );
});

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
  getItemLayout: PropTypes.func,
  updateCellsBatchingPeriod: PropTypes.number,
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
  getItemLayout: (data, index) => ({
    length: 45,
    offset: 45 * index,
    index,
  }),
  updateCellsBatchingPeriod: 500,
  initialNumToRender: 20,
  removeClippedSubviews: true,
  windowSize: 5,
};

export default DataTable;
