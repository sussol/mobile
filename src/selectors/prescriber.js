import { UIDatabase } from '../database';

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const selectCurrentPrescriber = ({ prescriber }) => {
  const { currentPrescriber } = prescriber;
  return currentPrescriber;
};

export const selectPrescriberName = ({ prescriber }) => {
  const currentPrescriber = selectCurrentPrescriber({ prescriber });
  return `${currentPrescriber?.firstName} ${currentPrescriber?.lastName}`.trim();
};

export const selectSortedAndFilteredPrescribers = ({ prescriber }) => {
  const { searchTerm, sortKey, isAscending } = prescriber;

  const queryString = 'firstName CONTAINS[c] $0 OR lastName CONTAINS[c] $0';
  const newData = UIDatabase.objects('Prescriber')
    .filtered(queryString, searchTerm)
    .sorted(sortKey, isAscending);

  return newData;
};
