/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';

import { selectAvailableCredit } from '../selectors/patient';
import { selectPrescriptionTotal } from '../selectors/payment';
import { UIDatabase } from '../database';

export const PAYMENT_ACTIONS = {
  CHOOSE_POLICY: 'Payment/choosePolicy',
  CHOOSE_PAYMENT_TYPE: 'Payment/choosePaymentType',
  UPDATE_PAYMENT: 'Payment/updatePayment',
  CREDIT_OVERFLOW: 'Payment/creditOverflow',
};

const updatePayment = amount => ({ type: PAYMENT_ACTIONS.UPDATE_PAYMENT, payload: { amount } });
const creditOverflow = () => ({ type: PAYMENT_ACTIONS.CREDIT_OVERFLOW });

const choosePolicy = insurancePolicy => (dispatch, getState) => {
  const { payment } = getState();
  const { transaction } = payment;

  UIDatabase.write(() => {
    UIDatabase.update('Transaction', {
      ...transaction,
      insurancePolicy,
    });
  });

  dispatch({ type: PAYMENT_ACTIONS.CHOOSE_POLICY, payload: { insurancePolicy } });
};

const choosePaymentType = paymentType => (dispatch, getState) => {
  const { payment } = getState();
  const { transaction } = payment;

  UIDatabase.write(() => {
    UIDatabase.update('Transaction', {
      ...transaction,
      option: paymentType,
    });
  });

  dispatch({ type: PAYMENT_ACTIONS.CHOOSE_PAYMENT_TYPE, payload: { paymentType } });
};

const validatePayment = amount => (dispatch, getState) => {
  const { payment, patient } = getState();

  const availableCredit = selectAvailableCredit({ patient });
  const prescriptionTotal = selectPrescriptionTotal({ payment });

  const difference = prescriptionTotal.subtract(amount);

  batch(() => {
    dispatch(updatePayment(amount));
    if (difference.value > availableCredit) dispatch(creditOverflow());
  });
};

export const PaymentActions = {
  validatePayment,
  choosePolicy,
  choosePaymentType,
};
