/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { createSelector } from 'reselect';

import { UIDatabase } from '../database';
import currency from '../localization/currency';

import {
  CASH_TRANSACTION_TYPES,
  CASH_TRANSACTION_INPUT_MODAL_FIELDS,
} from '../utilities/modules/dispensary/constants';

const selectTransaction = ({ cashTransaction }) => cashTransaction;

const selectName = createSelector([selectTransaction], ({ name }) => name);

const selectType = createSelector([selectTransaction], ({ type }) => type);

const selectAmount = createSelector([selectTransaction], ({ amount }) => amount);

const selectPaymentType = createSelector([selectTransaction], ({ paymentType }) => paymentType);

const selectReason = createSelector([selectTransaction], ({ reason }) => reason);

const selectDescription = createSelector([selectTransaction], ({ description }) => description);

const selectBalance = createSelector([selectPaymentType], paymentType => {
  const receiptBalance = UIDatabase.objects('Transaction')
    .filtered('type == "receipt" && paymentType.code == $0', paymentType?.code)
    .sum('subtotal');
  const paymentBalance = UIDatabase.objects('Transaction')
    .filtered('type == "payment" && paymentType.code == $0', paymentType?.code)
    .sum('subtotal');
  return currency(receiptBalance - paymentBalance);
});

const selectAmountBuffer = createSelector([selectTransaction], ({ amountBuffer }) => amountBuffer);

const selectDescriptionBuffer = createSelector(
  [selectTransaction],
  ({ descriptionBuffer }) => descriptionBuffer
);

const selectInputModal = createSelector([selectTransaction], ({ inputModal }) => inputModal);

const selectIsInputModalOpen = createSelector([selectInputModal], ({ isOpen }) => isOpen);

const selectInputModalField = createSelector([selectInputModal], ({ field }) => field);

const selectIsInputNameModalOpen = createSelector(
  [selectIsInputModalOpen, selectInputModalField],
  (isInputModalOpen, inputModalField) =>
    isInputModalOpen && inputModalField === CASH_TRANSACTION_INPUT_MODAL_FIELDS.NAME
);

const selectIsInputAmountModalOpen = createSelector(
  [selectIsInputModalOpen, selectInputModalField],
  (isInputModalOpen, inputModalField) =>
    isInputModalOpen && inputModalField === CASH_TRANSACTION_INPUT_MODAL_FIELDS.AMOUNT
);

const selectIsInputPaymentTypeModalOpen = createSelector(
  [selectIsInputModalOpen, selectInputModalField],
  (isInputModalOpen, inputModalField) =>
    isInputModalOpen && inputModalField === CASH_TRANSACTION_INPUT_MODAL_FIELDS.PAYMENT_TYPE
);

const selectIsInputReasonModalOpen = createSelector(
  [selectIsInputModalOpen, selectInputModalField],
  (isInputModalOpen, inputModalField) =>
    isInputModalOpen && inputModalField === CASH_TRANSACTION_INPUT_MODAL_FIELDS.REASON
);

const selectIsInputDescriptionModalOpen = createSelector(
  [selectIsInputModalOpen, selectInputModalField],
  (isInputModalOpen, inputModalField) =>
    isInputModalOpen && inputModalField === CASH_TRANSACTION_INPUT_MODAL_FIELDS.DESCRIPTION
);

const selectIsValid = createSelector(
  [selectName, selectType, selectAmount, selectPaymentType, selectReason],
  (name, type, amount, paymentType, reason) =>
    !!name &&
    !!amount &&
    amount > currency(0) &&
    (type === CASH_TRANSACTION_TYPES.CASH_IN || !!reason) &&
    !!paymentType
);

export const CashTransactionSelectors = {
  name: selectName,
  type: selectType,
  amount: selectAmount,
  paymentType: selectPaymentType,
  reason: selectReason,
  description: selectDescription,
  amountBuffer: selectAmountBuffer,
  descriptionBuffer: selectDescriptionBuffer,
  balance: selectBalance,
  isInputModalOpen: selectIsInputModalOpen,
  isInputNameModalOpen: selectIsInputNameModalOpen,
  isInputAmountModalOpen: selectIsInputAmountModalOpen,
  isInputPaymentTypeModalOpen: selectIsInputPaymentTypeModalOpen,
  isInputReasonModalOpen: selectIsInputReasonModalOpen,
  isInputDescriptionModalOpen: selectIsInputDescriptionModalOpen,
  isValid: selectIsValid,
};
