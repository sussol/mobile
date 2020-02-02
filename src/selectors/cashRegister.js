/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { pageStateSelector } from './pageSelectors';

import currency from '../localization/currency';

/**
 * Derives current balance from cash register transactions.
 * @return {Number}
 */
export const selectTransactions = createSelector([pageStateSelector], pageState => pageState.data);

export const selectTransactionType = createSelector(
  [pageStateSelector],
  pageState => pageState.transactionType
);

export const selectPayments = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'payment')
);

export const selectReceipts = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'receipt')
);

export const selectTransactionData = createSelector(
  [selectTransactionType, selectTransactions, selectPayments, selectReceipts],
  (transactionType, transactions, payments, receipts) => {
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

export const selectPaymentsTotal = createSelector([selectPayments], payments =>
  payments.reduce((acc, { total }) => acc.add(total), currency(0))
);
export const selectReceiptsTotal = createSelector([selectReceipts], receipts =>
  receipts.reduce((acc, { total }) => acc.add(total), currency(0))
);

export const selectBalance = createSelector(
  [selectReceiptsTotal, selectPaymentsTotal],
  (receiptsTotal, paymentsTotal) => receiptsTotal.subtract(paymentsTotal).format()
);
