/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';

import { selectUsingHideSnapshotColumn } from './modules';
import { COLUMN_KEYS } from '../pages/dataTableUtilities/constants';

/**
 *  Selects the `pages` state.
 */
export const selectPages = state => state?.pages ?? {};

/**
 * Selects the current routes state.
 */
export const selectPageState = state => {
  const pages = selectPages(state);
  const { currentRoute = '' } = pages;
  const pageState = pages[currentRoute] ?? state;
  const { data = [] } = pageState;
  return { ...pageState, data };
};

/**
 * Selects a pageObject field from within the `pages` state.
 */
export const selectPageObject = createSelector([selectPageState], pageState => {
  const { pageObject } = pageState;
  return pageObject;
});

/**
 * Selects stocktakeEditor page from `pages` state.
 */
export const selectStocktakeEditor = createSelector([selectPages], pages => {
  const { stocktakeEditor } = pages;
  return stocktakeEditor;
});

/**
 * Selects stocktake editor columns.
 */
export const selectStocktakeEditorColumns = createSelector(
  [selectUsingHideSnapshotColumn, selectStocktakeEditor],
  (usingHideSnapshotColumn, stocktakeEditor) => {
    const { columns } = stocktakeEditor;
    const stocktakeColumns = [...columns];
    return usingHideSnapshotColumn
      ? stocktakeColumns.filter(({ key }) => key !== COLUMN_KEYS.SNAPSHOT_TOTAL_QUANTITY)
      : stocktakeColumns;
  }
);
