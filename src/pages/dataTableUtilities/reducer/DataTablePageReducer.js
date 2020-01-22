/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { CellReducerLookup } from './cellReducers';
import { RowReducerLookup } from './rowReducers';
import { TableReducerLookup } from './tableReducers';
import { PageReducerLookup } from './pageReducers';

/**
 * Reducer for DataTable pages. Composed of all methods from
 * cellReducers, rowReducers, tableReducers and pageReducers.
 */

const DataTablePageReducerLookup = {
  ...CellReducerLookup,
  ...RowReducerLookup,
  ...TableReducerLookup,
  ...PageReducerLookup,
};

export const DataTablePageReducer = (state, action) => {
  const { type } = action;
  if (!DataTablePageReducerLookup[type]) return state;
  return DataTablePageReducerLookup[type](state, action);
};
