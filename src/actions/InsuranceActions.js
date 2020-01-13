/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import { batch } from 'react-redux';

import { UIDatabase, generateUUID } from '../database';
import { selectCurrentPatient } from '../selectors/patient';
import { PaymentActions } from './PaymentActions';

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

const create = completedForm => (dispatch, getState) => {
  const currentPatient = selectCurrentPatient(getState());

  let insurancePolicy;
  UIDatabase.write(() => {
    insurancePolicy = UIDatabase.update('InsurancePolicy', {
      ...completedForm,
      id: generateUUID(),
      type: 'personal',
      discountRate: 20,
      expiryDate: new Date(),
      patient: currentPatient,
      insuranceProvider: UIDatabase.objects('InsuranceProvider')[0],
    });
  });

  dispatch(save(insurancePolicy));
};

const update = completedForm => (dispatch, getState) => {
  const { insurance } = getState();
  const { currentInsurancePolicy } = insurance;

  let insurancePolicy;
  UIDatabase.write(() => {
    insurancePolicy = UIDatabase.update('InsurancePolicy', {
      ...currentInsurancePolicy,
      ...completedForm,
    });
  });

  dispatch(save(insurancePolicy));
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
  create,
};
