/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import currency from '../localization/currency';
import { UIDatabase } from '../database';

export const selectPrescriptionSubTotal = ({ payment }) => {
  const { transaction } = payment;
  const batches = transaction?.getTransactionBatches(UIDatabase) || [];
  const total = batches.reduce((acc, { totalPrice }) => acc.add(totalPrice), currency(0));
  return total;
};

export const selectDiscountAmount = ({ payment }) => {
  const { insurancePolicy } = payment;
  const subtotal = selectPrescriptionSubTotal({ payment });

  const insuranceDiscountRate = insurancePolicy ? (insurancePolicy.discountRate || 100) / 100 : 0;
  const discountAmount = currency(subtotal).multiply(insuranceDiscountRate);

  return discountAmount;
};

export const selectPrescriptionTotal = ({ payment }) => {
  const subtotal = selectPrescriptionSubTotal({ payment });
  const insuranceAmount = selectDiscountAmount({ payment });

  const total = subtotal?.subtract(insuranceAmount) ?? currency(0);

  return total;
};

export const selectCreditBeingUsed = ({ payment }) => {
  const { paymentAmount } = payment;

  const prescriptionTotal = selectPrescriptionTotal({ payment });
  const creditBeingUsed = Math.max(prescriptionTotal.subtract(paymentAmount).value, 0);

  return currency(creditBeingUsed);
};

export const selectChangeRequired = state => {
  const { payment } = state;
  const { paymentAmount } = payment;
  const prescriptionTotal = selectPrescriptionTotal(state);

  if (paymentAmount.value <= prescriptionTotal.value) return currency(0);

  return paymentAmount.subtract(prescriptionTotal);
};
