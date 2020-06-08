/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import { batch } from 'react-redux';

import { UIDatabase } from '../database';
import { selectCurrentPatient } from '../selectors/patient';
import { PaymentActions } from './PaymentActions';
import { selectCurrentUser } from '../selectors/user';
import { createRecord } from '../database/utilities';

export const INSURANCE_ACTIONS = {
  CREATE: 'Insurance/create',
  EDIT: 'Insurance/edit',
  SAVE: 'Insurance/save',
  CLOSE: 'Insurance/close',
  SELECT: 'Insurance/select',
};

const cancel = () => ({ type: INSURANCE_ACTIONS.CLOSE });
const edit = () => ({ type: INSURANCE_ACTIONS.EDIT });
const createNew = () => ({ type: INSURANCE_ACTIONS.CREATE });

const selectPolicy = insurancePolicy => ({
  type: INSURANCE_ACTIONS.SELECT,
  payload: { insurancePolicy },
});

const save = insurancePolicy => ({
  type: INSURANCE_ACTIONS.SAVE,
  payload: { insurancePolicy },
});

const update = policyDetails => (dispatch, getState) => {
  const { insurance, prescription } = getState();
  const { currentInsurancePolicy } = insurance;
  const { transaction } = prescription;

  const currentUser = selectCurrentUser(getState());
  const currentPatient = selectCurrentPatient(getState());

  const {
    id: currentId,
    policyNumberPerson: currentNumberPerson,
    policyNumberFamily: currentNumberFamily,
    discountRate: currentDiscountRate,
    policyProvider: currentProvider,
    isActive: currentIsActive,
    expiryDate: currentExpiryDate,
    type: currentType,
  } = currentInsurancePolicy ?? {};

  const {
    id: policyId,
    nameId: patientId,
    policyNumberPerson,
    policyNumberFamily,
    discountRate: policyDiscountRate,
    insuranceProviderId: policyProviderId,
    isActive: policyIsActive,
    expiryDate: policyExpiryDate,
    type: policyType,
  } = policyDetails ?? {};

  const policyRecord = {
    id: policyId ?? currentId,
    policyNumberPerson: policyNumberPerson ?? currentNumberPerson,
    policyNumberFamily: policyNumberFamily ?? currentNumberFamily,
    discountRate: policyDiscountRate ?? currentDiscountRate,
    insuranceProvider: policyProviderId
      ? UIDatabase.getOrCreate('InsuranceProvider', policyProviderId)
      : currentProvider,
    isActive: policyIsActive ?? currentIsActive,
    type: policyType ?? currentType,
    expiryDate: policyExpiryDate ?? currentExpiryDate,
    patient: patientId ? UIDatabase.getOrCreate('Name', patientId) : currentPatient,
    enteredBy: currentUser,
  };

  let insurancePolicy;
  UIDatabase.write(() => {
    insurancePolicy = createRecord(UIDatabase, 'InsurancePolicy', policyRecord);
  });

  if (transaction) {
    batch(() => {
      dispatch(save(insurancePolicy));
      dispatch(select(insurancePolicy));
    });
  }
};

const select = insurancePolicy => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;

  UIDatabase.write(() => {
    UIDatabase.update('Transaction', { ...transaction, insurancePolicy });
  });

  batch(() => {
    dispatch(PaymentActions.setPolicy(insurancePolicy));
    dispatch(selectPolicy(insurancePolicy));
  });
};

export const InsuranceActions = {
  cancel,
  createNew,
  edit,
  select,
  update,
};
