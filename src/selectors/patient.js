/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { sortDataBy } from '../utilities';

export const selectPatientHistory = ({ patient }) => {
  const { currentPatient } = patient;
  const { transactions } = currentPatient;

  // Create a query string `transaction.id == "{id} OR transaction.id == "{id}" ...`
  // finding all transaction batches for the patient.
  const queryString = transactions.map(({ id }) => `transaction.id == "${id}"`).join(' OR ');
  return queryString ? UIDatabase.objects('TransactionBatch').filtered(queryString) : [];
};

export const selectSortedPatientHistory = ({ patient }) => {
  const { sortKey, isAscending } = patient;
  const patientHistory = selectPatientHistory({ patient });

  return patientHistory ? sortDataBy(patientHistory.slice(), sortKey, isAscending) : patientHistory;
};

export const selectCurrentPatient = ({ patient }) => {
  const { currentPatient } = patient;
  return currentPatient;
};

export const selectPatientName = ({ patient }) => {
  const currentPatient = selectCurrentPatient({ patient });
  return `${currentPatient?.firstName} ${currentPatient?.lastName}`.trim();
};

export const selectAvailableCredit = ({ patient }) => patient?.currentPatient?.availableCredit;
