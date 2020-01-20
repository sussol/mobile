/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import { createSelector } from 'reselect';
import { sortDataBy } from '../utilities';

const selectSortKey = ({ supplierCredit }) => {
  const { sortKey } = supplierCredit;
  return sortKey;
};

const selectIsAscending = ({ supplierCredit }) => {
  const { isAscending } = supplierCredit;
  return isAscending;
};

const selectCreditableBatches = ({ supplierCredit }) => {
  const { batches } = supplierCredit;
  return batches;
};

export const selectSortFields = createSelector(
  [selectSortKey, selectIsAscending],
  (sortKey, isAscending) => ({ sortKey, isAscending })
);

export const selectSortedBatches = createSelector(
  [selectSortKey, selectIsAscending, selectCreditableBatches],
  (sortKey, isAscending, batches) => sortDataBy(batches, sortKey, isAscending)
);
