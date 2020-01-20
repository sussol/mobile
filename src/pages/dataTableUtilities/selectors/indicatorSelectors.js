/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { mapIndicatorTableRows, mapIndicatorTableColumns } from '../getIndicatorTableData';
import { pageStateSelector, pageObjectSelector } from './pageSelectors';

export const selectIndicatorRows = createSelector(
  [pageStateSelector],
  pageState => pageState.indicatorRows
);

export const selectIndicatorColumns = createSelector(
  [pageStateSelector],
  pageState => pageState.indicatorColumns
);

export const selectPeriod = createSelector([pageObjectSelector], pageObject => pageObject.period);

export const selectSearchTerm = createSelector(
  [pageStateSelector],
  pageState => pageState.searchTerm
);

/**
 * Maps indicator rows to data table row objects.
 * @param {Array.<IndicatorAttribute>} indicatorRows
 */
export const selectIndicatorTableRows = createSelector(
  [selectIndicatorRows, selectPeriod, selectSearchTerm],
  (indicatorRows, period, searchTerm) => mapIndicatorTableRows(indicatorRows, period, searchTerm)
);

/**
 * Maps indicator columns to data table column objects.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 */
export const selectIndicatorTableColumns = createSelector(
  [selectIndicatorColumns],
  indicatorColumns => mapIndicatorTableColumns(indicatorColumns)
);
