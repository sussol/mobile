/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const ROW_DETAIL_KEYS = {
  ITEM_DETAIL: 'itemDetail',
  SUPPLIER_REQUISITION_ITEM_DETAIL: 'supplierRequisitionItemDetail',
  CUSTOMER_REQUISITION_ITEM_DETAIL: 'customerRequisitionItemDetail',
};

export const ROW_DETAIL_ACTIONS = {
  OPEN_ITEM_DETAIL: 'rowDetail/openItemDetail',
  OPEN_SUPPLIER_REQUISITION_ITEM_DETAIL: 'rowDetail/openSupplierRequisitionItemDetail',
  OPEN_CUSTOMER_REQUISITION_ITEM_DETAIL: 'rowDetail/openCustomerRequisitionItemDetail',
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

const openCustomerRequisitionItemDetail = requisitionItem => ({
  type: ROW_DETAIL_ACTIONS.OPEN_CUSTOMER_REQUISITION_ITEM_DETAIL,
  payload: { rowData: requisitionItem },
});

const close = () => ({ type: ROW_DETAIL_ACTIONS.CLOSE });

export const RowDetailActions = {
  openItemDetail,
  close,
  openSupplierRequisitionItemDetail,
  openCustomerRequisitionItemDetail,
};
