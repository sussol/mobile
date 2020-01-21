/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { batch } from 'react-redux';
import { createRecord, UIDatabase } from '../database';
import { refreshRow } from '../pages/dataTableUtilities/actions/cellActions';

export const SUPPLIER_CREDIT_ACTIONS = {
  CREATE_FROM_ITEM: 'SupplierCredit/createFromItem',
  CREATE_FROM_TRANSACTION: 'SupplierCredit/createFromTransaction',
  CLOSE: 'SupplierCredit/close',
  SORT: 'SupplierCredit/sort',
  EDIT_RETURN_AMOUNT: 'SupplierCredit/editReturnAmount',
};

const sort = sortKey => ({ type: SUPPLIER_CREDIT_ACTIONS.SORT, payload: { sortKey } });

const close = () => ({ type: SUPPLIER_CREDIT_ACTIONS.CLOSE });

const create = () => (dispatch, getState) => {
  const { supplierCredit, user } = getState();
  const { batches } = supplierCredit;
  const { currentUser } = user;

  // Only work with the batches whose return amount is greater than 0.
  const batchesToReturn = batches.reduce(
    (acc, batch) => (batch.returnAmount ? [...acc, batch] : acc),
    []
  );

  // Group the batches with a return amount by supplier to make a credit for each
  // supplier grouping { supplierId1: [batch1, batch2, ... batchn], supplierId2: [...], ...}
  const batchesGroupedBySupplier = batchesToReturn.reduce((groupings, batch) => {
    const { id: suppliersId } = batch?.itemBatch.supplier;
    const suppliersGrouping = groupings[suppliersId];

    if (suppliersGrouping) return { ...groupings, [suppliersId]: suppliersGrouping.push(batch) };
    return { ...groupings, [suppliersId]: [batch] };
  }, {});

  UIDatabase.write(() => {
    Object.entries(batchesGroupedBySupplier).forEach(([supplierId, suppliersBatches]) => {
      const newSupplierCredit = createRecord(
        UIDatabase,
        'SupplierCredit',
        currentUser,
        supplierId,
        suppliersBatches
      );
      console.log('#################################');
      console.log(newSupplierCredit.serialNumber);
      console.log(newSupplierCredit.type);
      console.log('#################################');
    });
  });

  batch(() => {
    dispatch(close());

    dispatch({ type: 'refreshData', payload: { route: 'stock' } });
  });
};

const editReturnAmount = (returnAmount, batchId) => ({
  type: SUPPLIER_CREDIT_ACTIONS.EDIT_RETURN_AMOUNT,
  payload: { batchId, returnAmount },
});

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
  editReturnAmount,
  create,
};
