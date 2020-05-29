/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const CASH_TRANSACTION_ACTION_TYPES = {
  UPDATE_NAME: 'CashTransaction/updateName',
  TOGGLE_TYPE: 'CashTransaction/toggleType',
  UPDATE_AMOUNT: 'CashTransaction/updateAmount',
  UPDATE_PAYMENT_TYPE: 'CashTransaction/updatePaymentType',
  UPDATE_REASON: 'CashTransaction/updateReason',
  UPDATE_DESCRIPTION: 'CashTransaction/updateDescription',
  OPEN_INPUT_MODAL: 'CashTransaction/openInputModal',
  CLOSE_INPUT_MODAL: 'CashTransaction/closeInputModal',
};

export const CashTransactionActions = {
  updateName: name => ({ type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_NAME, payload: { name } }),
  toggleType: () => ({ type: CASH_TRANSACTION_ACTION_TYPES.TOGGLE_TYPE }),
  updateAmount: amount => ({
    type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_AMOUNT,
    payload: { amount },
  }),
  updatePaymentType: paymentType => ({
    type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_PAYMENT_TYPE,
    payload: { paymentType },
  }),
  updateReason: reason => ({
    type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_REASON,
    payload: { reason },
  }),
  updateDescription: description => ({
    type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_DESCRIPTION,
    payload: { description },
  }),
  openInputModal: modalField => ({
    type: CASH_TRANSACTION_ACTION_TYPES.OPEN_INPUT_MODAL,
    payload: { modalField },
  }),
  closeInputModal: () => ({ type: CASH_TRANSACTION_ACTION_TYPES.CLOSE_INPUT_MODAL }),
};
