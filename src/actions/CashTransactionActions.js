/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const CASH_TRANSACTION_ACTION_TYPES = {
  INITIALISE: 'CashTransaction/initialise',
  RESET: 'CashTransaction/reset',
  UPDATE_NAME: 'CashTransaction/updateName',
  TOGGLE_TYPE: 'CashTransaction/toggleType',
  UPDATE_AMOUNT: 'CashTransaction/updateAmount',
  UPDATE_PAYMENT_TYPE: 'CashTransaction/updatePaymentType',
  UPDATE_REASON: 'CashTransaction/updateReason',
  UPDATE_DESCRIPTION: 'CashTransaction/updateDescription',
  INITIALISE_AMOUNT_BUFFER: 'CashTransaction/initialiseAmountBuffer',
  INITIALISE_DESCRIPTION_BUFFER: 'CashTransaction/initialiseDescriptionBuffer',
  UPDATE_AMOUNT_BUFFER: 'CashTransaction/updateAmountBuffer',
  UPDATE_DESCRIPTION_BUFFER: 'CashTransaction/updateDescriptionBuffer',
  OPEN_INPUT_MODAL: 'CashTransaction/openInputModal',
  CLOSE_INPUT_MODAL: 'CashTransaction/closeInputModal',
};

export const CashTransactionActions = {
  initialise: () => ({ type: CASH_TRANSACTION_ACTION_TYPES.INITIALISE }),
  reset: () => ({ type: CASH_TRANSACTION_ACTION_TYPES.RESET }),
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
  initialiseAmountBuffer: () => ({ type: CASH_TRANSACTION_ACTION_TYPES.INITIALISE_AMOUNT_BUFFER }),
  initialiseDescriptionBuffer: () => ({
    type: CASH_TRANSACTION_ACTION_TYPES.INITIALISE_DESCRIPTION_BUFFER,
  }),
  updateAmountBuffer: amount => ({
    type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_AMOUNT_BUFFER,
    payload: { amount },
  }),
  updateDescriptionBuffer: description => ({
    type: CASH_TRANSACTION_ACTION_TYPES.UPDATE_DESCRIPTION_BUFFER,
    payload: { description },
  }),
  openInputModal: modalField => ({
    type: CASH_TRANSACTION_ACTION_TYPES.OPEN_INPUT_MODAL,
    payload: { modalField },
  }),
  closeInputModal: () => ({ type: CASH_TRANSACTION_ACTION_TYPES.CLOSE_INPUT_MODAL }),
};
