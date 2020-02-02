/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { createSelector } from 'reselect';
import moment from 'moment';

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

export const selectDataSetInUse = ({ dispensary }) => {
  const dataSet = selectDataSet({ dispensary });
  const usingPatientsDataSet = dataSet === 'patient';
  const usingPrescribersDataSet = dataSet === 'prescriber';

  return [usingPatientsDataSet, usingPrescribersDataSet];
};

export const selectFilteredData = createSelector(
  [selectData, selectSearchTerm, selectDataSetInUse],
  (data, searchTerm, [usingPatientsDataSet]) => {
    const [lastName, firstName, birthYearString] = searchTerm
      .split(/,|-d/)
      .map(name => name.trim());

    const birthYearDate = moment(birthYearString || new Date(null), 'Y', null, true).toDate();

    const queryString = 'firstName BEGINSWITH[c] $0 AND lastName BEGINSWITH[c] $1';
    const newData = data.filtered(queryString, firstName, lastName, birthYearDate);

    return usingPatientsDataSet ? newData.filtered('dateOfBirth >= $0', birthYearDate) : newData;
  }
);

export const selectSortedData = createSelector(
  [selectFilteredData, selectIsAscending, selectSortKey],
  (data, isAscending, sortKey) => data.sorted(sortKey, isAscending)
);
