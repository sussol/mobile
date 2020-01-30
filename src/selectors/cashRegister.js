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

export const selectReceipts = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'receipt')
);

export const selectPayments = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'payment')
);

export const selectReceiptsTotal = createSelector([selectReceipts], receipts =>
  receipts.reduce((acc, { total }) => acc + total, 0)
);

export const selectPaymentsTotal = createSelector([selectPayments], payments =>
  payments.reduce((acc, { total }) => acc + total, 0)
);

export const selectBalance = createSelector(
  [selectReceiptsTotal, selectPaymentsTotal],
  (receiptsTotal, paymentsTotal) => currency(receiptsTotal - paymentsTotal).format(false)
);
