/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Refreshes a single row of data.
 * use case: Refreshing a row after having been edited within Realm.
 */
export const refreshRow = (state, action) => {
  const { payload } = action;
  const { rowKey } = payload;
  const { dataState } = state;

  // Change object reference of row in `dataState` to trigger rerender of that row.
  // Realm object reference in `data` can't be affected in any tidy manner.
  const newDataState = new Map(dataState);
  const nextRowState = newDataState.get(rowKey);
  newDataState.set(rowKey, { ...nextRowState });

  return { ...state, dataState: newDataState };
};

export const refreshIndicatorRow = state => {
  const { selectedIndicator } = state;
  return { ...state, indicatorRows: selectedIndicator.rows };
};

export const CellReducerLookup = {
  refreshRow,
  refreshIndicatorRow,
};
