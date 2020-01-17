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

export const selectIsRequestRequisition = createSelector(
  [pageObjectSelector],
  pageObject => pageObject.isRequest
);

export const selectPeriod = createSelector([pageObjectSelector], pageObject => pageObject.period);

/**
 * Maps indicator rows to data table row objects.
 * @param {Array.<IndicatorAttribute>} indicatorRows
 */
export const selectIndicatorTableRows = createSelector(
  [selectIndicatorRows, selectPeriod],
  (indicatorRows, period) => mapIndicatorTableRows(indicatorRows, period)
);

/**
 * Maps indicator columns to data table column objects.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 */
export const selectIndicatorTableColumns = createSelector(
  [selectIndicatorColumns, selectIsRequestRequisition],
  (indicatorColumns, isRequestRequisition) =>
    mapIndicatorTableColumns(indicatorColumns, isRequestRequisition)
);
