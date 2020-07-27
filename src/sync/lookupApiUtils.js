/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */

import moment from 'moment';
import querystring from 'querystring';
import { Client as BugsnagClient } from 'bugsnag-react-native';
import { AUTH_ERROR_CODES } from 'sussol-utilities';

import { UIDatabase } from '../database';
import { createRecord, parseBoolean, parseDate, parseNumber } from '../database/utilities';

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  EMPTY_RESPONSE: 'No records found',
};

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

const bugsnagClient = new BugsnagClient();

class BugsnagError extends Error {
  constructor(message, data, ...args) {
    super(message, ...args);
    bugsnagClient.notify(this, report => {
      report.errorMessage = message;
      report.metadata = data;
    });
  }
}

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
  const query = params.reduce((queryObject, param) => {
    const [[key, value], [, type]] = Object.entries(param);
    if (!value) return queryObject;
    const paramValue = type !== TYPES.DATE ? `@${value}@` : moment(value).format('DDMMYYYY');
    return { ...queryObject, [key]: paramValue };
  }, {});
  return `?${querystring.stringify(query)}`;
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
  const endpoint = RESOURCES.PATIENT;
  const queryString = getPatientQueryString(params);
  return endpoint + queryString;
};

export const getPrescriberRequestUrl = params => {
  const endpoint = RESOURCES.PRESCRIBER;
  const queryString = getPrescriberQueryString(params);
  return endpoint + queryString;
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

const processResponse = async response => {
  const { ok, status, url, headers } = response;
  if (ok) {
    const responseData = await response.json();
    const { error: responseError } = responseData;
    if (responseError) throw new BugsnagError(responseError, { url, headers });
    if (!responseData.length) throw new Error(ERROR_CODES.EMPTY_RESPONSE);
    return responseData;
  }
  switch (status) {
    case 400:
    default:
      throw new Error(ERROR_CODES.CONNECTION_FAILURE);
    case 401:
      throw new BugsnagError(ERROR_CODES.INVALID_PASSWORD, { url, headers });
  }
};

export const processPatientResponse = async response => {
  const result = await processResponse(response);
  return result.map(
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
};

export const processPrescriberResponse = response => {
  processResponse(response).map(
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
};
