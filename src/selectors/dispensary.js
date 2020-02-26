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
    const [names, birthYearString] = searchTerm.split(/-d/).map(name => name.trim());
    const [lastName, firstName] = names.split(/,/).map(name => name.trim());

    const birthYearDate = moment(birthYearString || new Date(1900, 0, 0), 'Y', null, true);
    const filterByBirthDate = usingPatientsDataSet && birthYearDate.isValid();

    let filteredData = lastName ? data.filtered('lastName BEGINSWITH[c] $0', lastName) : data;
    filteredData = firstName
      ? filteredData.filtered('firstName BEGINSWITH[c] $0', firstName)
      : filteredData;

    return filterByBirthDate
      ? filteredData.filtered('dateOfBirth >= $0', birthYearDate.toDate())
      : filteredData;
  }
);

export const selectSortedData = createSelector(
  [selectFilteredData, selectIsAscending, selectSortKey],
  (data, isAscending, sortKey) => data.sorted(sortKey, !isAscending)
);
