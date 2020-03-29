/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { SETTINGS_KEYS } from '../../settings';
import { UIDatabase } from '../../database';

const { SYNC_URL } = SETTINGS_KEYS;

const RESOURCES = {
  PATIENT: '/api/v4/patient',
  PRESCRIBER: '/api/v4/prescriber',
};

const SEPARATORS = {
  QUERY_STRING: '?',
  QUERY_PARAMETERS: '&',
  POLICY_NUMBER: '-',
};

const getQueryString = params => {
  const {
    firstName = '',
    lastName = '',
    registrationCode = '',
    dateOfBirth = '',
    policyNumberPerson = '',
    policyNumberFamily = '',
  } = params ?? {};
  const policyNumberSeparator =
    policyNumberPerson && policyNumberFamily ? SEPARATORS.POLICY_NUMBER : '';
  const policyNumber = policyNumberPerson + policyNumberSeparator + policyNumberFamily;
  const queryParams = [
    { first_name: firstName },
    { last_name: lastName },
    { code: registrationCode },
    { dob: dateOfBirth },
    { policy_number: policyNumber },
  ];
  return queryParams.reduce((queryString, param) => {
    const [[key, value]] = Object.entries(param);
    if (!value) return queryString;
    const paramString = `${key}=${value}`;
    const paramSeparator = queryString.length > 0 ? SEPARATORS.PARAMETERS : SEPARATORS.QUERY_STRING;
    return queryString + paramSeparator + paramString;
  }, '');
};

const getPatientRequestUrl = params => {
  const baseUrl = UIDatabase.getSetting(SYNC_URL);
  const endpoint = RESOURCES.PATIENT;
  const queryString = getQueryString(params);
  return baseUrl + endpoint + queryString;
};

const getPrescriberRequestUrl = params => {
  const baseUrl = UIDatabase.getSetting(SYNC_URL);
  const endpoint = RESOURCES.PRESCRIBER;
  const queryString = getQueryString(params);
  return baseUrl + endpoint + queryString;
};

const processPatientResponse = async response => {
  const responseJson = await response.json();
  const { error } = responseJson;
  if (error) throw new Error(error);
  const patientData = responseJson.map(patient => ({
    firstName: patient.first,
    lastName: patient.last,
    dateOfBirth: new Date(patient.date_of_birth),
  }));
  return patientData;
};

const processPrescriberResponse = async response => {
  const responseJson = await response.json();
  const { error } = responseJson;
  if (error) throw new Error(error);
  const prescriberData = responseJson.map(prescriber => ({
    firstName: prescriber.first,
    lastName: prescriber.last,
    registrationCode: prescriber.code,
  }));
  return prescriberData;
};

export const queryPatientApi = async params => {
  const requestUrl = getPatientRequestUrl(params);
  try {
    const response = await fetch(requestUrl);
    const patientData = await processPatientResponse(response);
    return patientData;
  } catch (error) {
    // TODO: add bugsnag.
    return [];
  }
};

export const queryPrescriberApi = async params => {
  const requestUrl = getPrescriberRequestUrl(params);
  try {
    const response = await fetch(requestUrl);
    const prescriberData = await processPrescriberResponse(response);
    return prescriberData;
  } catch (error) {
    // TODO: add bugsnag.
    return [];
  }
};
