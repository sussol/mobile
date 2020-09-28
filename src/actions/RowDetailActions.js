/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const ROW_DETAIL_KEYS = {
  ITEM_DETAIL: 'itemDetail',
  REQUISITION_ITEM_DETAIL: 'supplierRequisitionItemDetail',
};

export const ROW_DETAIL_ACTIONS = {
  OPEN_ITEM_DETAIL: 'rowDetail/openItemDetail',
  OPEN_SUPPLIER_REQUISITION_ITEM_DETAIL: 'rowDetail/openRequisitionItemDetail',
  CLOSE: 'rowDetail/close',
};

const openItemDetail = item => ({
  type: ROW_DETAIL_ACTIONS.OPEN_ITEM_DETAIL,
  payload: { rowData: item },
});

const openSupplierRequisitionItemDetail = requisitionItem => ({
  type: ROW_DETAIL_ACTIONS.OPEN_SUPPLIER_REQUISITION_ITEM_DETAIL,
  payload: { rowData: requisitionItem },
});

const close = () => ({ type: ROW_DETAIL_ACTIONS.CLOSE });

export const RowDetailActions = { openItemDetail, close, openSupplierRequisitionItemDetail };
