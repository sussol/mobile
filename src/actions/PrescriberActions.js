/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { batch } from 'react-redux';

import { createRecord, UIDatabase } from '../database';
import { DispensaryActions } from './DispensaryActions';

export const PRESCRIBER_ACTIONS = {
  EDIT: 'Prescriber/edit',
  CREATE: 'Prescriber/create',
  COMPLETE: 'Prescriber/complete',
  SET: 'Prescriber/set',
  FILTER: 'Prescriber/filter',
  SORT: 'Prescriber/sort',
};

const filterData = searchTerm => ({ type: PRESCRIBER_ACTIONS.FILTER, payload: { searchTerm } });

const sortData = sortKey => ({ type: PRESCRIBER_ACTIONS.SORT, payload: { sortKey } });

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

  if (currentPrescriber) {
    const { addressOne, addressTwo } = completedForm;
    const { address } = currentPrescriber;

    UIDatabase.write(() => {
      UIDatabase.update('Address', { ...address, line1: addressOne, line2: addressTwo });
      UIDatabase.update('Prescriber', { ...currentPrescriber, ...completedForm });
    });
  } else {
    UIDatabase.write(() => createRecord(UIDatabase, 'Prescriber', completedForm));
  }

  batch(() => {
    dispatch(closeModal());
    dispatch(DispensaryActions.refresh());
  });
};

export const PrescriberActions = {
  createPrescriber,
  updatePrescriber,
  editPrescriber,
  closeModal,
  setPrescriber,
  filterData,
  sortData,
};
