/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { getAuthHeader } from 'sussol-utilities';

import { SETTINGS_KEYS } from '../../settings';
import { UIDatabase } from '../../database';

import { NAME_TYPES } from '../../sync/syncTranslators';
import { getOrCreateAddress, parseBoolean, parseDate } from '../../sync/incomingSyncUtils';

const { THIS_STORE_ID, SYNC_URL, SYNC_SITE_NAME, SYNC_SITE_PASSWORD_HASH } = SETTINGS_KEYS;

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

export const createPatientRecord = response => {
  const { 
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
    type,
    isCustomer,
    isSupplier,
    isManufacturer,
    supplyingStoreId,
    thisStoresPatient,
    isPatient,
    firstName,
    lastName,
    dateOfBirth,
  } = response;
  const billingAddress = getOrCreateAddress(
    UIDatabase,
    billAddress1,
    billAddress2,
    billAddress3,
    billAddress4,
    billPostalZipCode
  );
  const patient = {
    id,
    name,
    code,
    phoneNumber,
    billingAddress,
    emailAddress,
    type,
    isCustomer,
    isSupplier,
    isManufacturer,
    supplyingStoreId,
    thisStoresPatient,
    isPatient,
    firstName,
    lastName,
    dateOfBirth,
    isVisible: true,
  };
  UIDatabase.write(() => UIDatabase.update('Name', patient));
};

export const createPrescriberRecord = response => {
  const {
    id,
    firstName,
    lastName,
    registrationCode,
    address1,
    address2,
    phoneNumber,
    mobileNumber,
    emailAddress,
    fromThisStore,
  } = response;
  const address = getOrCreateAddress(UIDatabase, address1, address2);
  const prescriber = {
    id,
    firstName,
    lastName,
    registrationCode,
    address,
    isVisible: true,
    isActive: true,
    phoneNumber,
    mobileNumber,
    emailAddress,
    fromThisStore,
  };
  UIDatabase.write(() => UIDatabase.update('Prescriber', prescriber));
}

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

const processPatientResponse = async response => {
  const responseJson = await response.json();
  const { error } = responseJson;
  if (error) throw new Error(error);
  const patientData = responseJson.map(
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
      type,
      customer,
      supplier,
      manufacturer,
      supplying_store_id: supplyingStoreId,
      first: firstName,
      last: lastName,
      date_of_birth,
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
      type: NAME_TYPES.translate(type),
      isCustomer: parseBoolean(customer),
      isSupplier: parseBoolean(supplier),
      isManufacturer: parseBoolean(manufacturer),
      supplyingStoreId,
      isPatient: true,
      thisStoresPatient: supplyingStoreId === UIDatabase.getSetting(THIS_STORE_ID),
      firstName,
      lastName,
      dateOfBirth: parseDate(date_of_birth),
    })
  );
  return patientData;
};

const processPrescriberResponse = async response => {
  const responseJson = await response.json();
  const { error } = responseJson;
  if (error) throw new Error(error);
  const prescriberData = responseJson.map(
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
      fromThisStore: store_ID === UIDatabase.getSetting(THIS_STORE_ID),
    })
  );
  return prescriberData;
};

export const queryPatientApi = async params => {
  const requestUrl = getPatientRequestUrl(params);
  const headers = getRequestHeaders();
  try {
    const response = await fetch(requestUrl, { headers });
    const patientData = await processPatientResponse(response);
    return patientData;
  } catch (error) {
    // TODO: add bugsnag.
    return [];
  }
};

export const queryPrescriberApi = async params => {
  const requestUrl = getPrescriberRequestUrl(params);
  const headers = getRequestHeaders();
  try {
    const response = await fetch(requestUrl, { headers });
    const prescriberData = await processPrescriberResponse(response);
    return prescriberData;
  } catch (error) {
    // TODO: add bugsnag.
    return [];
  }
};
