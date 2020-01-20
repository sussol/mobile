/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { SUPPLIER_CREDIT_ACTIONS } from '../actions/SupplierCreditActions';
import { UIDatabase } from '../database/index';

const toBatchLookup = batches =>
  batches.reduce((acc, batch) => {
    const { id } = batch;
    return { ...acc, [id]: batch };
  }, {});

const mapBatchToObject = batches =>
  batches.map(batch => ({
    ...batch,
    returnQuantity: 0,
    otherPartyName: batch.transaction?.otherParty?.name,
    totalQuantity: batch.totalQuantity,
  }));

const initialState = () => ({
  batches: [],
  toBatchLookup: {},
  open: false,
  sortKey: 'otherPartyName',
  isAscending: true,
});

export const SupplierCreditReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_ITEM: {
      const { payload } = action;
      const { itemId } = payload;

      const batches = UIDatabase.objects('TransactionBatch').filtered(
        'itemId == $0 && numberOfPacks > 0 && transaction.type == $1 &&' +
          'transaction.otherParty.type != $2',
        itemId,
        'supplier_invoice',
        'inventory_adjustment'
      );

      return {
        ...state,
        open: true,
        batches: mapBatchToObject(batches),
        allBatches: toBatchLookup(batches),
      };
    }

    case SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_TRANSACTION: {
      const { payload } = action;
      const { transactionId } = payload;

      const batches = UIDatabase.objects('TransactionBatch').filtered(
        'transaction.id == $0 && numberOfPacks > 0',
        transactionId
      );

      return {
        ...state,
        open: true,
        batches: mapBatchToObject(batches),
        allBatches: toBatchLookup(batches),
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
