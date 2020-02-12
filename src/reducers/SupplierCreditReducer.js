/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { SUPPLIER_CREDIT_ACTIONS } from '../actions/SupplierCreditActions';
import { UIDatabase } from '../database';
import { parsePositiveInteger } from '../utilities';

const mapBatchToObject = batches =>
  batches.map(batch => ({
    returnAmount: 0,
    id: batch.id,
    totalQuantity: batch.totalQuantity,
    itemBatch: batch,
    otherPartyName: batch.otherPartyName,
    batch: batch.batch,
    costPrice: batch.costPrice,
    itemName: batch.itemName,
    expiryDate: batch.expiryDate,
    itemCode: batch.itemCode,
  }));

const initialState = () => ({
  batches: [],
  open: false,
  sortKey: 'otherPartyName',
  isAscending: true,
  item: null,
  invoice: null,
  category: null,
  title: '',
  reasons: UIDatabase.objects('SupplierCreditCategory'),
});

export const SupplierCreditReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case SUPPLIER_CREDIT_ACTIONS.EDIT_RETURN_AMOUNT: {
      const { batches } = state;
      const { payload } = action;
      const { batchId, returnAmount } = payload;

      const rowToEditIndex = batches.findIndex(({ id }) => id === batchId);

      const { totalQuantity } = batches[rowToEditIndex];
      const adjustmentAmount = parsePositiveInteger(returnAmount);

      const newRow = {
        ...batches[rowToEditIndex],
        returnAmount: adjustmentAmount <= totalQuantity ? adjustmentAmount : 0,
      };
      batches[rowToEditIndex] = newRow;

      return { ...state, batches: [...batches] };
    }

    case SUPPLIER_CREDIT_ACTIONS.EDIT_CATEGORY: {
      const { payload } = action;
      const { category } = payload;
      return { ...state, category };
    }

    case SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_ITEM: {
      const { payload } = action;
      const { itemId } = payload;

      const item = UIDatabase.get('Item', itemId);

      return {
        ...state,
        batches: mapBatchToObject(item?.batches?.filtered('numberOfPacks > 0') ?? []),
        open: true,
        item,
        type: 'supplierCreditFromItem',
      };
    }

    case SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_INVOICE: {
      const { payload } = action;
      const { invoice } = payload;

      const transactionBatches = invoice?.getTransactionBatches(UIDatabase) ?? [];
      const itemBatches = transactionBatches.map(({ itemBatch }) => itemBatch);

      return {
        ...state,
        open: true,
        batches: mapBatchToObject(itemBatches),
        invoice,
        type: 'supplierCreditFromInvoice',
      };
    }

    case SUPPLIER_CREDIT_ACTIONS.SORT: {
      const { isAscending, sortKey } = state;
      const { payload } = action;
      const { sortKey: newSortKey } = payload;

      return {
        ...state,
        sortKey: newSortKey,
        isAscending: sortKey === newSortKey ? !isAscending : true,
      };
    }

    case SUPPLIER_CREDIT_ACTIONS.CLOSE: {
      return initialState();
    }

    default:
      return state;
  }
};
