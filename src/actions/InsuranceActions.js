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

const update = completedForm => (dispatch, getState) => {
  const { insurance } = getState();
  const { currentInsurancePolicy } = insurance;
  const user = selectCurrentUser(getState());
  const patient = selectCurrentPatient(getState());

  const policyValues = { ...completedForm, patient, user };
  let insurancePolicy;

  if (currentInsurancePolicy) {
    UIDatabase.write(() => {
      insurancePolicy = UIDatabase.update('InsurancePolicy', {
        ...currentInsurancePolicy,
        ...completedForm,
      });
    });
  } else {
    UIDatabase.write(() => {
      insurancePolicy = createRecord(UIDatabase, 'InsurancePolicy', policyValues);
    });
  }

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
};
