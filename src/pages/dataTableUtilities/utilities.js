/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import newDataTableStyles from '../../globalStyles/newDataTableStyles';

/**
 * Utility methods used for DataTable pages.s
 */

/**
 * Simple get item layout for DataTable pages.
 * Should be memoized in a component for use.
 * @param {Number} index index of a row in VirtualizedList.
 */
export const DEFAULT_GET_ITEM_LAYOUT = (_, index) => {
  const { height } = newDataTableStyles.row;
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
export const DEFAULT_KEY_EXTRACTOR = item => item.id;
