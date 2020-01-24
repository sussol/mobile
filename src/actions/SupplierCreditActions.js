/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';
import { createRecord, UIDatabase } from '../database';
import { refreshData } from '../pages/dataTableUtilities/actions/tableActions';
import { ROUTES } from '../navigation/constants';

export const SUPPLIER_CREDIT_ACTIONS = {
  CREATE_FROM_ITEM: 'SupplierCredit/createFromItem',
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
  const batchesToReturn = batches.filter(({ returnAmount }) => returnAmount > 0);

  // Group the batches with a return amount by supplier to make a credit for each
  // supplier grouping { supplierId1: [batch1, batch2, ... batchn], supplierId2: [...], ...}
  const batchesGroupedBySupplier = batchesToReturn.reduce((groupings, itemBatch) => {
    const { id: supplierId } = itemBatch?.itemBatch.supplier;
    const suppliersGroup = groupings[supplierId];

    if (suppliersGroup) return { ...groupings, [supplierId]: suppliersGroup.push(itemBatch) };
    return { ...groupings, [supplierId]: [itemBatch] };
  }, {});

  UIDatabase.write(() => {
    Object.entries(batchesGroupedBySupplier).forEach(([supplierId, suppliersBatches]) => {
      const returnSum = -suppliersBatches.reduce(
        (total, { costPrice, returnAmount }) => total + costPrice * returnAmount,
        0
      );

      const newSupplierCredit = createRecord(
        UIDatabase,
        'SupplierCredit',
        currentUser,
        supplierId,
        returnSum
      );

      suppliersBatches.forEach(itemBatch =>
        createRecord(
          UIDatabase,
          'SupplierCreditLine',
          newSupplierCredit,
          itemBatch.itemBatch,
          itemBatch.returnAmount
        )
      );
    });
  });

  batch(() => {
    dispatch(close());
    dispatch(refreshData(ROUTES.STOCK));
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

export const SupplierCreditActions = {
  createFromItem,
  close,
  sort,
  editReturnAmount,
  create,
};
