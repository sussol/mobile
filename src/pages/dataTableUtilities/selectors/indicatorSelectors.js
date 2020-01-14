/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { mapIndicatorTableRows, mapIndicatorTableColumns } from '../getIndicatorTableData';

const getIndicatorRows = pageState => pageState.indicatorRows;
const getIndicatorColumns = pageState => pageState.indicatorColumns;
const getPeriod = pageState => pageState.pageObject.period;

export const getIndicatorTableRows = createSelector(
  [getIndicatorRows, getPeriod],
  (indicatorRows, period) => mapIndicatorTableRows(indicatorRows, period)
);

export const getIndicatorTableColumns = createSelector([getIndicatorColumns], indicatorColumns =>
  mapIndicatorTableColumns(indicatorColumns)
);
