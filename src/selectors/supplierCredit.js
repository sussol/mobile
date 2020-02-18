/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import { createSelector } from 'reselect';
import { sortDataBy } from '../utilities';
import { getColumns } from '../pages/dataTableUtilities';
import { dispensingStrings, generalStrings } from '../localization';

const selectSortKey = ({ supplierCredit }) => {
  const { sortKey } = supplierCredit;
  return sortKey;
};

const selectIsAscending = ({ supplierCredit }) => {
  const { isAscending } = supplierCredit;
  return isAscending;
};

export const selectCreditableBatches = ({ supplierCredit }) => {
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

export const selectItemName = ({ supplierCredit }) => {
  const { item } = supplierCredit;
  const { name } = item || {};
  return name;
};

export const selectItemCode = ({ supplierCredit }) => {
  const { item } = supplierCredit;
  const { code } = item || {};
  return code;
};

export const selectType = ({ supplierCredit }) => {
  const { type } = supplierCredit;
  return type;
};

export const selectColumns = createSelector([selectType], type => getColumns(type));

export const selectInvoice = ({ supplierCredit }) => {
  const { invoice } = supplierCredit;
  return invoice ?? {};
};

export const selectTitle = createSelector(
  [selectType, selectInvoice, selectItemName, selectItemCode],
  (type, invoice, itemName, itemCode) => {
    if (type === 'supplierCreditFromItem') {
      return `${dispensingStrings.available_credits_for} ${itemName} (${itemCode})`;
    }
    const { serialNumber, otherPartyName } = invoice;
    return `${dispensingStrings.supplier_credit_for_supplier_invoice} ${serialNumber} ${generalStrings.to} ${otherPartyName}`;
  }
);

export const selectCategoryName = ({ supplierCredit }) => {
  const { category } = supplierCredit;
  const { name } = category || {};
  return name ?? '';
};
