/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const ROW_DETAIL_KEYS = {
  ITEM_DETAIL: 'itemDetail',
  REQUISITION_ITEM_DETAIL: 'requisitionItemDetail',
};

export const ROW_DETAIL_ACTIONS = {
  OPEN_ITEM_DETAIL: 'rowDetail/openItemDetail',
  OPEN_REQUISITION_ITEM_DETAIL: 'rowDetail/openRequisitionItemDetail',
  CLOSE: 'rowDetail/close',
};

const openItemDetail = item => ({
  type: ROW_DETAIL_ACTIONS.OPEN_ITEM_DETAIL,
  payload: { rowData: item },
});

const openRequisitionItemDetail = requisitionItem => ({
  type: ROW_DETAIL_ACTIONS.OPEN_REQUISITION_ITEM_DETAIL,
  payload: { rowData: requisitionItem },
});

const close = () => ({ type: ROW_DETAIL_ACTIONS.CLOSE });

export const RowDetailActions = { openItemDetail, close, openRequisitionItemDetail };
