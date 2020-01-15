import { UIDatabase } from '../database/index';

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const selectData = ({ dispensary }) => {
  const { dataSet } = dispensary;
  return dataSet === 'patient' ? UIDatabase.objects('Patient') : UIDatabase.objects('Prescriber');
};

export const selectSortedAndFilteredData = ({ dispensary }) => {
  const { sortKey, isAscending, searchTerm } = dispensary;

  const [firstNameSearchTerm, lastNameSearchTerm] = searchTerm.split(',');

  const newData = selectData({ dispensary })
    .filtered(
      'firstName BEGINSWITH[c] $0 AND lastName BEGINSWITH[c] $1',
      firstNameSearchTerm.trim(),
      lastNameSearchTerm?.trim()
    )
    .sorted(sortKey, isAscending);

  return newData;
};
