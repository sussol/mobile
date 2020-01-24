/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { createSelector } from 'reselect';

export const selectSortKey = ({ dispensary }) => {
  const { sortKey } = dispensary;
  return sortKey;
};

export const selectSearchTerm = ({ dispensary }) => {
  const { searchTerm } = dispensary;
  return searchTerm;
};

export const selectIsAscending = ({ dispensary }) => {
  const { isAscending } = dispensary;
  return isAscending;
};

export const selectDataSet = ({ dispensary }) => {
  const { dataSet } = dispensary;
  return dataSet;
};

export const selectData = ({ dispensary }) => {
  const { data } = dispensary;
  return data;
};

export const selectFilteredData = createSelector(
  [selectData, selectSearchTerm],
  (data, searchTerm) => {
    const [firstName, lastName] = searchTerm.split(',').map(name => name.trim());

    const queryString = 'firstName BEGINSWITH[c] $0 AND lastName BEGINSWITH[c] $1';
    const newData = data.filtered(queryString, firstName, lastName);

    return newData;
  }
);

export const selectSortedData = createSelector(
  [selectFilteredData, selectIsAscending, selectSortKey],
  (data, isAscending, sortKey) => data.sorted(sortKey, isAscending)
);

export const selectDataSetInUse = ({ dispensary }) => {
  const dataSet = selectDataSet({ dispensary });
  const usingPatientsDataSet = dataSet === 'patient';
  const usingPrescribersDataSet = dataSet === 'prescriber';

  return [usingPatientsDataSet, usingPrescribersDataSet];
};
