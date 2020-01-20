/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const SUPPLIER_CREDIT_ACTIONS = {
  CREATE_FROM_ITEM: 'SupplierCredit/createFromItem',
  CREATE_FROM_TRANSACTION: 'SupplierCredit/createFromTransaction',
  CLOSE: 'SupplierCredit/close',
  SORT: 'SupplierCredit/sort',
};

const sort = sortKey => ({ type: SUPPLIER_CREDIT_ACTIONS.SORT, payload: { sortKey } });

const close = () => ({ type: SUPPLIER_CREDIT_ACTIONS.CLOSE });

const createFromItem = itemId => ({
  type: SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_ITEM,
  payload: { itemId },
});

const createFromTransaction = transaction => ({
  type: SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_TRANSACTION,
  payload: { transaction },
});

export const SupplierCreditActions = {
  createFromItem,
  createFromTransaction,
  close,
  sort,
};
