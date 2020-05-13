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

const updatePrescriber = prescriberDetails => (dispatch, getState) => {
  const { prescriber } = getState();
  const { currentPrescriber } = prescriber;

  const {
    id: currentPrescriberId,
    firstName: currentFirstName,
    lastName: currentLastName,
    registrationCode: currentRegistrationCode,
    addressOne: currentAddressOne,
    addressTwo: currentAddressTwo,
    phoneNumber: currentPhoneNumber,
    mobileNumber: currentMobileNumber,
    emailAddress: currentEmailAddress,
    female: currentFemale,
    storeId: currentStoreId,
    isActive: currentIsActive,
  } = currentPrescriber ?? {};

  const {
    id: prescriberId,
    firstName: prescriberFirstName,
    lastName: prescriberLastName,
    registrationCode: prescriberRegistrationCode,
    addressOne: prescriberAddressOne,
    addressTwo: prescriberAddressTwo,
    phoneNumber: prescriberPhoneNumber,
    emailAddress: prescriberEmailAddress,
    female: prescriberFemale,
    storeId: prescriberStoreId,
  } = prescriberDetails ?? {};

  const id = prescriberId ?? currentPrescriberId;
  const firstName = prescriberFirstName ?? currentFirstName;
  const lastName = prescriberLastName ?? currentLastName;
  const registrationCode = prescriberRegistrationCode ?? currentRegistrationCode;
  const addressOne = prescriberAddressOne ?? currentAddressOne;
  const addressTwo = prescriberAddressTwo ?? currentAddressTwo;
  const phoneNumber = prescriberPhoneNumber ?? currentPhoneNumber;
  const mobileNumber = currentMobileNumber;
  const emailAddress = prescriberEmailAddress ?? currentEmailAddress;
  const female = prescriberFemale ?? currentFemale;
  const storeId = prescriberStoreId ?? currentStoreId;
  const isActive = currentIsActive;

  const prescriberRecord = {
    id,
    firstName,
    lastName,
    registrationCode,
    addressOne,
    addressTwo,
    phoneNumber,
    mobileNumber,
    emailAddress,
    female,
    storeId,
    isActive,
  };

  UIDatabase.write(() => createRecord(UIDatabase, 'Prescriber', prescriberRecord));

  batch(() => {
    dispatch(closeModal());
    dispatch(DispensaryActions.closeLookupModal());
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
