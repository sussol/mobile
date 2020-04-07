/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */

import { getAuthHeader, AUTH_ERROR_CODES } from 'sussol-utilities';

import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';
import { createRecord, parseBoolean, parseDate, parseNumber } from '../database/utilities';

const { SYNC_URL, SYNC_SITE_NAME, SYNC_SITE_PASSWORD_HASH } = SETTINGS_KEYS;

const CONNECTION_TIMEOUT_PERIOD = 10000;

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  NO_MATCHING_RECORDS: 'No matching records found',
};

const RESOURCES = {
  PATIENT: '/api/v4/patient',
  PRESCRIBER: '/api/v4/prescriber',
};

const SEPARATORS = {
  QUERY_STRING: '?',
  QUERY_PARAMETERS: '&',
  POLICY_NUMBER: '-',
};

const getRequestHeaders = () => {
  const username = UIDatabase.getSetting(SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SYNC_SITE_PASSWORD_HASH);
  return { Authorization: getAuthHeader(username, password) };
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

const getQueryString = params =>
  params.reduce((queryString, param) => {
    const [[key, value]] = Object.entries(param);
    if (!value) return queryString;
    const paramString = `${key}=${value}`;
    const paramSeparator = queryString.length > 0 ? SEPARATORS.PARAMETERS : SEPARATORS.QUERY_STRING;
    return queryString + paramSeparator + paramString;
  }, '');

const getPrescriberQueryString = ({ firstName = '', lastName = '', registrationCode = '' }) => {
  const queryParams = [
    { first_name: firstName },
    { last_name: lastName },
    { code: registrationCode },
  ];
  return getQueryString(queryParams);
};

const getPatientQueryString = ({
  firstName = '',
  lastName = '',
  dateOfBirth = '',
  policyNumberPerson = '',
  policyNumberFamily = '',
} = {}) => {
  const policyNumberSeparator =
    policyNumberPerson && policyNumberFamily ? SEPARATORS.POLICY_NUMBER : '';
  const policyNumberFull = policyNumberPerson + policyNumberSeparator + policyNumberFamily;
  const queryParams = [
    { first_name: firstName },
    { last_name: lastName },
    { dob: dateOfBirth },
    { policy_number: policyNumberFull },
  ];
  return getQueryString(queryParams);
};

const getPatientRequestUrl = params => {
  const baseUrl = UIDatabase.getSetting(SYNC_URL);
  const endpoint = RESOURCES.PATIENT;
  const queryString = getPatientQueryString(params);
  return baseUrl + endpoint + queryString;
};

const getPrescriberRequestUrl = params => {
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

const processPatientResponse = response => {
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

const processPrescriberResponse = response => {
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

export const queryPatientApi = async params => {
  const requestUrl = getPatientRequestUrl(params);
  const headers = getRequestHeaders();
  const options = { headers };
  try {
    const response = await fetchTimeout(requestUrl, options, CONNECTION_TIMEOUT_PERIOD);
    const { ok, status } = response;
    if (ok) {
      const responseJson = await response.json();
      const { error } = responseJson;
      if (error) throw new Error(error);
      const patientData = processPatientResponse(responseJson);
      return patientData?.length
        ? { data: patientData }
        : { error: ERROR_CODES.NO_MATCHING_RECORDS };
    }
    switch (status) {
      case 400:
        throw new Error(ERROR_CODES.INVALID_URL);
      case 401:
        throw new Error(ERROR_CODES.INVALID_PASSWORD);
      default:
        throw new Error(ERROR_CODES.CONNECTION_FAILURE);
    }
  } catch (error) {
    // TODO: add bugsnag.
    return { error: error.message };
  }
};

export const queryPrescriberApi = async params => {
  const requestUrl = getPrescriberRequestUrl(params);
  const headers = getRequestHeaders();
  const options = { headers };
  try {
    const response = await fetchTimeout(requestUrl, options, CONNECTION_TIMEOUT_PERIOD);
    const { ok, status } = response;
    if (ok) {
      const responseJson = await response.json();
      const { error } = responseJson;
      if (error) throw new Error(error);
      const prescriberData = await processPrescriberResponse(responseJson);
      return prescriberData?.length
        ? { data: prescriberData }
        : { error: ERROR_CODES.NO_MATCHING_RECORDS };
    }
    switch (status) {
      case 400:
        throw new Error(ERROR_CODES.INVALID_URL);
      case 401:
        throw new Error(ERROR_CODES.INVALID_PASSWORD);
      default:
        throw new Error(ERROR_CODES.CONNECTION_FAILURE);
    }
  } catch (error) {
    // TODO: add bugsnag.
    return { error: error.message };
  }
};

/**
 * A simple wrapper which adds a timeout to a fetch functionality.
 *
 * @param {String} url
 * @param {Object} options
 * @param {Number} timeout
 */
const fetchTimeout = (url, options, timeout) =>
  new Promise((resolve, reject) => {
    if (timeout) {
      const error = new Error(ERROR_CODES.CONNECTION_FAILURE);
      setTimeout(reject, timeout, error);
    }
    fetch(url, options).then(resolve, reject);
  });
