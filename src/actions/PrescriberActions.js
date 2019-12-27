/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase, generateUUID } from '../database';
import { PageActions } from '../pages/dataTableUtilities/actions';
import { ROUTES } from '../navigation/constants';

export const PRESCRIBER_ACTIONS = {
  EDIT: 'Prescriber/edit',
  CREATE: 'Prescriber/create',
  COMPLETE: 'Prescriber/complete',
  SET: 'Prescriber/set',
};

const setPrescriber = prescriber => ({ type: PRESCRIBER_ACTIONS.SET, payload: { prescriber } });

const closeModal = () => ({ type: PRESCRIBER_ACTIONS.COMPLETE });

const createPrescriber = () => ({ type: PRESCRIBER_ACTIONS.CREATE });

const editPrescriber = prescriber => ({
  type: PRESCRIBER_ACTIONS.EDIT,
  payload: { prescriber },
});

const updatePrescriber = completedForm => (dispatch, getState) => {
  const { prescriber } = getState();
  const { currentPrescriber } = prescriber;

  UIDatabase.write(() => {
    UIDatabase.update('Prescriber', {
      ...currentPrescriber,
      ...completedForm,
    });
  });

  dispatch(closeModal());
  dispatch(PageActions.refreshData(ROUTES.DISPENSARY));
};

const saveNewPrescriber = completedForm => dispatch => {
  UIDatabase.write(() => {
    UIDatabase.update('Prescriber', {
      id: generateUUID(),
      ...completedForm,
    });
  });

  dispatch(closeModal());
  dispatch(PageActions.refreshData(ROUTES.DISPENSARY));
};

export const PrescriberActions = {
  createPrescriber,
  updatePrescriber,
  editPrescriber,
  closeModal,
  saveNewPrescriber,
  setPrescriber,
};
