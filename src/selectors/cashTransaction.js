/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { createSelector } from 'reselect';

const selectTransaction = ({ cashTransaction }) => cashTransaction;

const selectName = createSelector([selectTransaction], ({ name }) => name);

const selectType = createSelector([selectTransaction], ({ type }) => type);

const selectAmount = createSelector([selectTransaction], ({ amount }) => amount);

const selectPaymentType = createSelector([selectTransaction], ({ paymentType }) => paymentType);

const selectReason = createSelector([selectTransaction], ({ reason }) => reason);

const selectDescription = createSelector([selectTransaction], ({ description }) => description);

export const CashTransactionSelectors = {
  name: selectName,
  type: selectType,
  amount: selectAmount,
  paymentType: selectPaymentType,
  reason: selectReason,
  description: selectDescription,
};
