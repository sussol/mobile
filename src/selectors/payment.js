/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import currency from 'currency.js';

export const selectPrescriptionSubTotal = ({ payment }) => {
  const { transaction } = payment;
  const { items = [] } = transaction || {};
  const total = items.reduce((acc, { totalPrice }) => acc + totalPrice || 0, 0);
  return currency(total);
};

export const selectPrescriptionTotal = ({ payment }) => {
  const { insurancePolicy } = payment;

  const subtotal = selectPrescriptionSubTotal({ payment });

  return currency(subtotal * (insurancePolicy ? insurancePolicy.discountRate / 100 : 1));
};

export const selectCreditBeingUsed = ({ payment }) => {
  const { paymentAmount } = payment;

  const prescriptionTotal = selectPrescriptionTotal({ payment });

  const creditBeingUsed = Math.max(prescriptionTotal.subtract(paymentAmount).value, 0);

  return currency(creditBeingUsed);
};
