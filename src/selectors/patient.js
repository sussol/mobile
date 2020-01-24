/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import currency from '../localization/currency';
import { UIDatabase } from '../database';
import { sortDataBy } from '../utilities';

export const selectPatientHistory = ({ patient }) => {
  const { currentPatient } = patient;
  const { transactions } = currentPatient;

  // Create a query string `transaction.id == "{id} OR transaction.id == "{id}" ...`
  // finding all transaction batches for the patient.
  const inQuery = transactions.map(({ id }) => `transaction.id == "${id}"`).join(' OR ');
  const baseQueryString = 'type != "cash_in" AND type != "cash_out"';
  const fullQuery = `(${inQuery}) AND ${baseQueryString}`;
  return inQuery ? UIDatabase.objects('TransactionBatch').filtered(fullQuery) : [];
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

export const selectAvailableCredit = ({ patient }) =>
  currency(patient?.currentPatient?.availableCredit);

export const selectPatientInsurancePolicies = ({ patient }) => {
  const { currentPatient } = patient;
  const { policies } = currentPatient;
  return policies;
};

export const selectPatientModalOpen = ({ patient }) => {
  const { isCreating, isEditing } = patient;
  const { viewingHistory } = patient;
  return [isCreating || isEditing, viewingHistory];
};
