/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { SUPPLIER_CREDIT_ACTIONS } from '../actions/SupplierCreditActions';
import { UIDatabase } from '../database/index';
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
  }));

const initialState = () => ({
  batches: [],
  open: false,
  sortKey: 'otherPartyName',
  isAscending: true,
  item: null,
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
        item: UIDatabase.get('Item', itemId),
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
