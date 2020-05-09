/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */

import moment from 'moment';
import querystring from 'querystring';
import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';
import { createRecord, parseBoolean, parseDate, parseNumber } from '../database/utilities';

const { SYNC_URL } = SETTINGS_KEYS;

const RESOURCES = {
  PATIENT: '/api/v4/patient',
  PRESCRIBER: '/api/v4/prescriber',
};

const TYPES = {
  STRING: 'string',
  DATE: 'date',
};

const PARAMETERS = {
  firstName: { key: 'first_name', type: TYPES.STRING },
  lastName: { key: 'last_name', type: TYPES.STRING },
  dateOfBirth: { key: 'dob', type: TYPES.DATE },
  policyNumber: { key: 'policy_number', type: TYPES.STRING },
  registrationCode: { key: 'code', type: TYPES.STRING },
};

export const createPatientRecord = patient => {
  patient?.policies?.forEach(createPolicyRecord);
};

export const createPolicyRecord = policy => {
  const { nameId, enteredById, insuranceProviderId } = policy;
  const enteredBy = UIDatabase.getOrCreate('User', enteredById);
  const patient = UIDatabase.getOrCreate('Name', nameId);
  const insuranceProvider = UIDatabase.getOrCreate('InsuranceProvider', insuranceProviderId);
  const policyRecord = { ...policy, enteredBy, patient, insuranceProvider };
  UIDatabase.write(() => createRecord(UIDatabase, 'InsurancePolicy', policyRecord));
};

const getQueryString = params => {
  const object = params.reduce((queryObject, param) => {
    const [[key, value], [, type]] = Object.entries(param);
    if (!value) return queryObject;
    const paramValue = type !== TYPES.DATE ? `@${value}@` : moment(value).format('YYYYMMDD');
    return { ...queryObject, [key]: paramValue };
  }, {});
  const queryString = `?${querystring.stringify(object)}`;
  return queryString;
};

const getPrescriberQueryString = ({ firstName = '', lastName = '', registrationCode = '' }) => {
  const queryParams = [
    { [PARAMETERS.firstName.key]: firstName, type: PARAMETERS.firstName.type },
    { [PARAMETERS.lastName.key]: lastName, type: PARAMETERS.lastName.type },
    { [PARAMETERS.registrationCode.key]: registrationCode, type: PARAMETERS.registrationCode.type },
  ];
  return getQueryString(queryParams);
};

const getPatientQueryString = ({
  firstName = '',
  lastName = '',
  dateOfBirth = '',
  policyNumber = '',
} = {}) => {
  const queryParams = [
    { [PARAMETERS.firstName.key]: firstName, type: PARAMETERS.firstName.type },
    { [PARAMETERS.lastName.key]: lastName, type: PARAMETERS.lastName.type },
    { [PARAMETERS.dateOfBirth.key]: dateOfBirth, type: PARAMETERS.dateOfBirth.type },
    { [PARAMETERS.policyNumber.key]: policyNumber, type: PARAMETERS.policyNumber.type },
  ];
  return getQueryString(queryParams);
};

export const getPatientRequestUrl = params => {
  const baseUrl = UIDatabase.getSetting(SYNC_URL);
  const endpoint = RESOURCES.PATIENT;
  const queryString = getPatientQueryString(params);
  return baseUrl + endpoint + queryString;
};

export const getPrescriberRequestUrl = params => {
  const baseUrl = UIDatabase.getSetting(SYNC_URL);
  const endpoint = RESOURCES.PRESCRIBER;
  const queryString = getPrescriberQueryString(params);
  return baseUrl + endpoint + queryString;
};

const processInsuranceResponse = response =>
  response.map(
    ({
      ID: id,
      insuranceProviderID: insuranceProviderId,
      nameID: nameId,
      policyNumberFamily,
      policyNumberPerson,
      discountRate,
      expiryDate,
      isActive,
      enteredByID: enteredById,
      type,
    }) => ({
      id,
      insuranceProviderId,
      nameId,
      policyNumberFamily,
      policyNumberPerson,
      discountRate: parseNumber(discountRate),
      expiryDate: parseDate(expiryDate),
      isActive: parseBoolean(isActive),
      enteredById,
      type,
    })
  );

export const processPatientResponse = response => {
  const patientData = response.map(
    ({
      ID: id,
      name,
      code,
      phone: phoneNumber,
      bill_address1: billAddress1,
      bill_address2: billAddress2,
      bill_address3: billAddress3,
      bill_address4: billAddress4,
      bill_postal_zip_code: billPostalZipCode,
      email: emailAddress,
      supplying_store_id: supplyingStoreId,
      first: firstName,
      last: lastName,
      date_of_birth,
      nameInsuranceJoin,
    }) => ({
      id,
      name,
      code,
      phoneNumber,
      billAddress1,
      billAddress2,
      billAddress3,
      billAddress4,
      billPostalZipCode,
      emailAddress,
      supplyingStoreId,
      firstName,
      lastName,
      dateOfBirth: parseDate(date_of_birth),
      policies: processInsuranceResponse(nameInsuranceJoin),
    })
  );
  return patientData;
};

export const processPrescriberResponse = response => {
  const prescriberData = response.map(
    ({
      ID,
      first_name,
      last_name,
      registration_code,
      address1,
      address2,
      phone,
      mobile,
      email,
      store_ID,
    }) => ({
      id: ID,
      firstName: first_name,
      lastName: last_name,
      registrationCode: registration_code,
      address1,
      address2,
      phoneNumber: phone,
      mobileNumber: mobile,
      emailAddress: email,
      storeId: store_ID,
    })
  );
  return prescriberData;
};
