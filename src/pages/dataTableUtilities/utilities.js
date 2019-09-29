/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { dataTableStyles } from '../../globalStyles';

/**
 * Utility methods used for DataTable pages.s
 */

/**
 * Simple get item layout for DataTable pages.
 * Should be memoized in a component for use.
 * @param {Number} index index of a row in VirtualizedList.
 */
export const getItemLayout = (_, index) => {
  const { height } = dataTableStyles.row;
  return {
    length: height,
    offset: height * index,
    index,
  };
};

/**
 * Simple keyExtractor for DataTable pages.
 *
 * @param {Object} item Any item to extract a key from.
 */
export const recordKeyExtractor = item => item.id;
