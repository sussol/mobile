/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { mapIndicatorTableRows, mapIndicatorTableColumns } from '../getIndicatorTableData';
import { pageStateSelector, pageObjectSelector } from './pageSelectors';

export const selectIndicators = createSelector(
  [pageStateSelector],
  pageState => pageState.indicators
);

export const selectIndicatorRows = createSelector(
  [pageStateSelector],
  pageState => pageState.indicatorRows
);

export const selectIndicatorColumns = createSelector(
  [pageStateSelector],
  pageState => pageState.indicatorColumns
);

export const selectCurrentIndicator = createSelector(
  [pageStateSelector],
  pageState => pageState.currentIndicator
);

export const selectCurrentIndicatorCode = createSelector(
  [selectCurrentIndicator],
  currentIndicator => currentIndicator.code
);

export const selectIndicatorCodes = createSelector([selectIndicators], indicators =>
  indicators.map(indicator => indicator.code)
);

export const selectIsRequestRequisition = createSelector(
  [pageObjectSelector],
  pageObject => pageObject.isRequest
);

export const selectPeriod = createSelector([pageObjectSelector], pageObject => pageObject.period);

/**
 * Maps indicator columns to data table column objects.
 * @param {Realm.Results.<IndicatorAttribute>} indicatorColumns
 */
export const selectIndicatorTableColumns = createSelector(
  [selectIndicatorColumns, selectIsRequestRequisition],
  (indicatorColumns, isRequestRequisition) =>
    mapIndicatorTableColumns(indicatorColumns, isRequestRequisition)
);

/**
 * Maps indicator rows to data table row objects.
 * @param {Realm.Results.<IndicatorAttribute>} indicatorRows
 */
export const selectIndicatorTableRows = createSelector(
  [selectIndicatorRows, selectPeriod],
  (indicatorRows, period) => mapIndicatorTableRows(indicatorRows, period)
);
