/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { COLUMN_TYPES } from './constants';
import { UIDatabase, createRecord } from '../../database';

const COLUMN_INDICATOR = {
  width: 1,
  sortable: false,
};

const COLUMN_INDICATOR_IMMUTABLE = {
  type: COLUMN_TYPES.STRING,
  editable: false,
  ...COLUMN_INDICATOR,
};

const COLUMN_INDICATOR_MUTABLE = {
  type: COLUMN_TYPES.EDITABLE_STRING,
  editable: true,
  ...COLUMN_INDICATOR,
};

const COLUMNS = {
  DESCRIPTION: {
    ...COLUMN_INDICATOR_IMMUTABLE,
    title: 'Description',
    key: 'description',
  },
  CODE: {
    ...COLUMN_INDICATOR_IMMUTABLE,
    title: 'Code',
    key: 'code',
  },
};

/**
 * Returns a filter method for finding a subset of an array of IndicatorAttribute objects by period.
 * @param {Array.<IndicatorAttribute>} filterPeriod
 * @return {Func}
 */
const filterByPeriod = filterPeriod => ({ period }) => period.id === filterPeriod.id;

/**
 * Returns a find method for querying an array of indicatorValue for the index of a given object.
 * @param {IndicatorValue} findValue
 * @return {Func}
 */
const findByValue = findValue => value => findValue.id === value.id;

/**
 * Query if an IndicatorValue array contains a given object.
 * @param {Array.<IndicatorValue>} values
 * @param {IndicatorValue} value
 */
const includesValue = (values, value) => {
  const result = values.findIndex(findByValue(value)) > 0;
  return result;
};

/**
 * Returns a filter method for getting the intersection of two arrays of IndicatorValue objects.
 * @param {Array.<IndicatorValue>} values
 * @return {Func}
 */
const filterByValues = values => value => includesValue(values, value);

/**
 * Intialise a new indicator value.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 */
const initialiseRowColumnValue = (row, column, period) => {
  let record;
  UIDatabase.write(() => {
    record = createRecord(UIDatabase, 'IndicatorValue', row, column, period);
  });
  return record;
};

/**
 * Get indicator column by code.
 * @param {ProgramIndicator} indicator
 * @param {string} code
 * @return {Array.<IndicatorAttribute>}
 */
const getIndicatorColumns = (indicator, code) =>
  indicator?.columns?.filter(({ code: columnCode }) => columnCode === code);

/**
 * Get indicator rows by id.
 * @param {ProgramIndicator} indicator
 * @param {string} id
 * @return {Array.<IndicatorAttribute>}
 */
const getIndicatorRows = (indicator, id) =>
  indicator?.rows?.filter(({ id: rowId }) => rowId === id);

/**
 * Get value for indicator row, column attribute pair.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 * @return {IndicatorValue}
 */
const getIndicatorRowColumnValue = (row, column, period) => {
  const rowValues = row.values.filter(filterByPeriod(period));
  const columnValues = column.values.filter(filterByPeriod(period));
  const rowColumnValues = rowValues?.filter(filterByValues(columnValues));
  const [rowColumnValue] = rowColumnValues;
  return rowColumnValue || initialiseRowColumnValue(row, column, period);
};

const getIndicatorData = indicator => ({
  rows: getIndicatorRows(indicator),
  columns: getIndicatorColumns(indicator),
});

/**
 * Get data table column for indicator column attribute.
 * @param {IndicatorAttribute} column
 * @return {object}
 */
const getIndicatorTableColumn = column => {
  const { description: title, code: key } = column;
  return {
    ...COLUMN_INDICATOR_MUTABLE,
    title,
    key,
  };
};

/**
 * Get data table columns for given indicator.
 * @param {ProgramIndicator} indicator
 * @returns {Array.<object>}
 */
const getIndicatorTableColumns = indicator => {
  if (!indicator) return [];
  const valueColumns = indicator.columns.map(column => getIndicatorTableColumn(column));
  return [COLUMNS.DESCRIPTION, COLUMNS.CODE, ...valueColumns];
};

/**
 * Get data table row for indicator row attribute.
 * @param {IndicatorAttribute} row
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 */
const getIndicatorTableRow = (row, indicator, period) => {
  const [rowObject] = indicator.rows.filter(({ id: rowId }) => rowId === row.id);
  const { id, description, code } = rowObject;
  const values = indicator.columns.reduce((acc, column) => {
    const { code: key } = column;
    const value = getIndicatorRowColumnValue(rowObject, column, period);
    return { ...acc, [key]: value.value };
  }, {});
  return { id, description, code, ...values };
};

/**
 * Get indicator data table rows.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {Array.<object>}
 */
const getIndicatorTableRows = (indicator, period) => {
  if (!indicator) return [];
  return indicator.rows.map(row => getIndicatorTableRow(row, indicator, period));
};

/**
 * Get indicator data table rows and columns.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {object}
 */
const getIndicatorTableData = (indicator, period) => {
  const columns = getIndicatorTableColumns(indicator, period);
  const rows = getIndicatorTableRows(indicator, period);
  return { columns, rows };
};

export {
  getIndicatorRows,
  getIndicatorColumns,
  getIndicatorRowColumnValue,
  getIndicatorData,
  getIndicatorTableRow,
  getIndicatorTableRows,
  getIndicatorTableColumns,
  getIndicatorTableData,
};
