/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { SUPPLIER_CREDIT_ACTIONS } from '../actions/SupplierCreditActions';
import { UIDatabase } from '../database/index';
import { parsePositiveInteger } from '../utilities';

const toBatchLookup = batches =>
  batches.reduce((acc, batch) => {
    const { id } = batch;
    return { ...acc, [id]: batch };
  }, {});

const mapBatchToObject = batches =>
  batches.map(batch => ({
    returnAmount: 0,
    totalQuantity: batch.totalQuantity,
    itemBatch: batch,
    costPrice: batch.costPrice,
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
    case SUPPLIER_CREDIT_ACTIONS.EDIT_RETURN_AMOUNT: {
      const { batches } = state;
      const { payload } = action;
      const { batchId, returnAmount } = payload;

      const rowToEditIndex = batches.findIndex(({ id }) => id === batchId);
      const newRow = {
        ...batches[rowToEditIndex],
        returnAmount: parsePositiveInteger(returnAmount),
      };

      batches[rowToEditIndex] = newRow;

      return { ...state, batches: [...batches] };
    }

    case SUPPLIER_CREDIT_ACTIONS.CREATE_FROM_ITEM: {
      const { payload } = action;
      const { itemId } = payload;

      const batches = UIDatabase.objects('ItemBatch').filtered(
        'item.id == $0 && numberOfPacks > 0',
        itemId
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

      const batches = UIDatabase.objects('ItemBatch').filtered(
        `${UIDatabase.get('Transaction', transactionId)
          .getTransactionBatches.map(({ itemBatch }) => `'${itemBatch.id}'`)
          .join(' OR ')} AND numberOfPacks > 0`
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
