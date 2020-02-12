/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';
import { createRecord, UIDatabase } from '../database';
import { getCurrentRouteName } from '../navigation/selectors';
import { refreshData } from '../pages/dataTableUtilities/actions/tableActions';

export const SUPPLIER_CREDIT_ACTIONS = {
  CREATE_FROM_ITEM: 'SupplierCredit/createFromItem',
  CREATE_FROM_INVOICE: 'SupplierCredit/createFromInvoice',
  CLOSE: 'SupplierCredit/close',
  SORT: 'SupplierCredit/sort',
  EDIT_RETURN_AMOUNT: 'SupplierCredit/editReturnAmount',
  EDIT_CATEGORY: 'SupplierCredit/editCategory',
};

const editCategory = category => ({
  type: SUPPLIER_CREDIT_ACTIONS.EDIT_CATEGORY,
  payload: { category },
});

const sort = sortKey => ({ type: SUPPLIER_CREDIT_ACTIONS.SORT, payload: { sortKey } });

const close = () => ({ type: SUPPLIER_CREDIT_ACTIONS.CLOSE });

const create = () => (dispatch, getState) => {
  const { supplierCredit, user } = getState();
  const currentRouteName = getCurrentRouteName(getState().nav);
  const { batches, category } = supplierCredit;
  const { currentUser } = user;

  // Only work with the batches whose return amount is greater than 0.
  const batchesToReturn = batches.filter(({ returnAmount }) => returnAmount > 0);

  // Group the batches with a return amount by supplier to make a credit for each
  // supplier grouping { supplierId1: [batch1, batch2, ... batchn], supplierId2: [...], ...}
  const batchesGroupedBySupplier = batchesToReturn.reduce((groupings, itemBatch) => {
    const { id: supplierId } = itemBatch.itemBatch?.supplier || {};
    const suppliersGroup = groupings[supplierId];

    if (suppliersGroup) return { ...groupings, [supplierId]: [...suppliersGroup, itemBatch] };
    return { ...groupings, [supplierId]: [itemBatch] };
  }, {});

  UIDatabase.write(() => {
    Object.entries(batchesGroupedBySupplier).forEach(([supplierId, suppliersBatches]) => {
      const returnSum =
        suppliersBatches?.reduce(
          (total, { costPrice, returnAmount }) => total - costPrice * returnAmount,
          0
        ) ?? 0;

      const newSupplierCredit = createRecord(
        UIDatabase,
        'SupplierCredit',
        currentUser,
        supplierId,
        returnSum
      );

      newSupplierCredit.category = category;

      suppliersBatches.forEach(itemBatch =>
        createRecord(
          UIDatabase,
          'SupplierCreditLine',
          newSupplierCredit,
          itemBatch.itemBatch,
          itemBatch.returnAmount
        )
      );

      UIDatabase.save('Transaction', newSupplierCredit);
    });
  });

  batch(() => {
    dispatch(close());
    dispatch(refreshData(currentRouteName));
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

const createFromInvoice = invoice => ({
  type: SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_INVOICE,
  payload: { invoice },
});

export const SupplierCreditActions = {
  createFromItem,
  close,
  sort,
  editReturnAmount,
  editCategory,
  create,
  createFromInvoice,
};
