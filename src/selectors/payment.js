/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import currency from 'currency.js';

export const selectPrescriptionSubTotal = ({ payment }) => {
  const { transaction } = payment;
  const { items = [] } = transaction || {};
  const total = items.reduce((acc, { totalPrice }) => currency(totalPrice || 0).add(acc), 0);
  return total;
};

export const selectPrescriptionTotal = ({ payment }) => {
  const { policy } = payment;
  console.log(!!policy);
  const subtotal = selectPrescriptionSubTotal({ payment });

  return currency(subtotal * (policy ? (policy.discountRate || 100) / 100 : 1));
};

export const selectCreditBeingUsed = ({ payment }) => {
  const { paymentAmount } = payment;

  const prescriptionTotal = selectPrescriptionTotal({ payment });

  const creditBeingUsed = Math.max(prescriptionTotal.subtract(paymentAmount).value, 0);

  return currency(creditBeingUsed);
};
