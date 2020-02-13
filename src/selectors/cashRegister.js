/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { pageInfoStrings } from '../localization';
import currency from '../localization/currency';
import { CASH_TRANSACTION } from '../utilities/modules/dispensary/constants';

const { PAYMENT_TYPES } = CASH_TRANSACTION;

export const selectCashRegisterState = state => state.pages.cashRegister;

export const selectTransactions = createSelector(
  [selectCashRegisterState],
  pageState => pageState.data
);

export const selectTransactionType = createSelector(
  [selectCashRegisterState],
  pageState => pageState.transactionType
);

export const selectSearchTerm = createSelector(
  [selectCashRegisterState],
  pageState => pageState.searchTerm
);

export const selectPayments = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'payment')
);

export const selectReceipts = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'receipt')
);

export const selectToggledTransactions = createSelector(
  [selectTransactions, selectPayments, selectReceipts, selectTransactionType],
  (transactions, payments, receipts, transactionType) => {
    switch (transactionType) {
      case 'payment':
        return payments;
      case 'receipt':
        return receipts;
      default:
        return transactions;
    }
  }
);

export const selectPaymentType = ({ pages }) => {
  const { cashRegister } = pages;
  const { currentPaymentType } = cashRegister ?? {};

  return currentPaymentType;
};

export const selectFilteredByPaymentTypeTransactions = createSelector(
  [selectToggledTransactions, selectPaymentType],
  (transactions, paymentType) => {
    if (paymentType) {
      const { code: filteringByCode } = paymentType;
      return transactions.filter(({ paymentType: transactionsPaymentType }) => {
        const { code } = transactionsPaymentType ?? {};
        return code === filteringByCode;
      });
    }
    return transactions;
  }
);

export const selectFilteredTransactions = createSelector(
  [selectFilteredByPaymentTypeTransactions, selectSearchTerm],
  (transactions, searchTerm) =>
    transactions.filter(({ otherParty }) =>
      otherParty.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
);

export const selectCashPayments = createSelector([selectPayments], payments =>
  payments.filter(payment => payment.paymentType?.code === PAYMENT_TYPES.CASH)
);

export const selectCashReceipts = createSelector([selectReceipts], receipts =>
  receipts.filter(receipt => receipt.paymentType?.code === PAYMENT_TYPES.CASH)
);

export const selectFilteredPaymentsByPaymentType = createSelector(
  [selectPayments, selectPaymentType],
  (payments, paymentType) => {
    if (paymentType) {
      const { code: selectedPaymentTypeCode } = paymentType;
      return payments.filter(({ paymentType: transactionPaymentType }) => {
        const { code: transactionPaymentTypeCode } = transactionPaymentType ?? {};
        return transactionPaymentTypeCode === selectedPaymentTypeCode;
      });
    }
    return payments;
  }
);

export const selectFilteredReceiptsByPaymentType = createSelector(
  [selectReceipts, selectPaymentType],
  (receipts, paymentType) => {
    if (paymentType) {
      const { code: selectedPaymentTypeCode } = paymentType;
      return receipts.filter(({ paymentType: transactionPaymentType }) => {
        const { code: transactionPaymentTypeCode } = transactionPaymentType ?? {};
        return transactionPaymentTypeCode === selectedPaymentTypeCode;
      });
    }
    return receipts;
  }
);

export const selectPaymentsTotal = createSelector([selectFilteredPaymentsByPaymentType], payments =>
  payments.reduce((acc, { total }) => acc.add(total), currency(0))
);

export const selectReceiptsTotal = createSelector([selectFilteredReceiptsByPaymentType], receipts =>
  receipts.reduce((acc, { total }) => acc.add(total), currency(0))
);

export const selectBalance = createSelector(
  [selectReceiptsTotal, selectPaymentsTotal],
  (receiptsTotal, paymentsTotal) => receiptsTotal.subtract(paymentsTotal).format()
);

export const selectCashRegisterInfoColumns = createSelector([selectBalance], currentBalance => [
  [
    {
      title: `${pageInfoStrings.current_balance}:`,
      info: currentBalance,
    },
  ],
]);
