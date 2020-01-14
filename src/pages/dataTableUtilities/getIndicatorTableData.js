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
 * Create a new indicator value.
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 * @return {IndicatorValue}
 */
const createIndicatorValue = (row, column, period) => {
  let record;
  UIDatabase.write(() => {
    record = createRecord(UIDatabase, 'IndicatorValue', row, column, period);
  });
  return record;
};

/**
 * Update indicator value object with new value.
 * @param {IndicatorValue} indicatorValue
 * @param {string} value
 */
const updateIndicatorValue = (indicatorValue, value) => {
  UIDatabase.write(() => {
    UIDatabase.update('IndicatorValue', { ...indicatorValue, value });
  });
};

/**
 * Get value for indicator row, column attribute pair.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 * @return {IndicatorValue}
 */
const getIndicatorValue = (row, column, period) => {
  const rowValues = row.values.filter(filterByPeriod(period));
  const columnValues = column.values.filter(filterByPeriod(period));
  const rowColumnValues = rowValues?.filter(filterByValues(columnValues));
  const [rowColumnValue] = rowColumnValues;
  return rowColumnValue || createIndicatorValue(row, column, period);
};

/**
 * Find indicator row by id.
 * @param {Array.<IndicatorAttribute} indicatorRows
 * @param {string} rowId
 * @return {IndicatorAttribute}
 */
const getIndicatorRow = (indicatorRows, rowId) => indicatorRows.find(({ id }) => id === rowId);

/**
 * Get indicator rows by id.
 * @param {ProgramIndicator} indicator
 * @param {string} id
 * @return {Array.<IndicatorAttribute>}
 */
const getIndicatorRows = (indicator, id) =>
  indicator?.rows?.filter(({ id: rowId }) => rowId === id);

/**
 * Find indicator column by code.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 * @param {string} columnCode
 * @return {IndicatorAttribute}
 */
const getIndicatorColumn = (indicatorColumns, columnCode) =>
  indicatorColumns.find(({ code }) => code === columnCode);

/**
 * Get indicator columns by code.
 * @param {ProgramIndicator} indicator
 * @param {string} code
 * @return {Array.<IndicatorAttribute>}
 */
const getIndicatorColumns = (indicator, code) =>
  indicator?.columns?.filter(({ code: columnCode }) => columnCode === code);

const getIndicatorData = indicator => ({
  rows: indicator.rows,
  columns: indicator.columns,
});

/**
 * Get data table row for indicator row attribute.
 * @param {IndicatorAttribute} row
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @return {object}
 */
const mapIndicatorTableRow = (row, period) => {
  const { id, description, code, indicator } = row;
  const values = indicator.columns.reduce((acc, column) => {
    const { code: key } = column;
    const value = getIndicatorValue(row, column, period);
    return { ...acc, [key]: value.value };
  }, {});
  return { id, description, code, ...values };
};

/**
 * Map indicator rows to data table row objects.
 * @param {Array.<IndicatorAttribute>} rows
 * @param {Period} period
 * @return {Array.<object>}
 */
const mapIndicatorTableRows = (rows, period) => rows.map(row => mapIndicatorTableRow(row, period));

/**
 * Get indicator data table row objects.
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @return {Array.<object>}
 */
const getIndicatorTableRows = (indicator, period) => {
  if (!indicator) return [];
  return mapIndicatorTableRows(indicator.rows, period);
};

/**
 * Get data table column for indicator row attribute.
 * @param {IndicatorAttribute} column
 * @return {object}
 */
const mapIndicatorTableColumn = column => {
  const { description: title, code: key } = column;
  return {
    ...COLUMN_INDICATOR_MUTABLE,
    title,
    key,
  };
};

/**
 * Map indicator columns to data table column objects.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 * @return {Array.<object>}
 */
const mapIndicatorTableColumns = indicatorColumns => {
  const valueColumns = indicatorColumns.map(mapIndicatorTableColumn);
  return [COLUMNS.DESCRIPTION, COLUMNS.CODE, ...valueColumns];
};

/**
 * Get indicator data table column objects.
 * @param {ProgramIndicator} indicator
 * @return {Array.<object>}
 */
const getIndicatorTableColumns = indicator => {
  if (!indicator) return [];
  return mapIndicatorTableColumns(indicator.columns);
};

/**
 * Get indicator data table rows and columns.
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {object}
 */
const getIndicatorTableData = (indicator, period) => {
  const columns = getIndicatorTableColumns(indicator);
  const rows = getIndicatorTableRows(indicator, period);
  return { columns, rows };
};

export {
  createIndicatorValue,
  updateIndicatorValue,
  getIndicatorValue,
  getIndicatorRow,
  getIndicatorRows,
  getIndicatorColumn,
  getIndicatorColumns,
  getIndicatorData,
  mapIndicatorTableRow,
  mapIndicatorTableRows,
  getIndicatorTableRows,
  mapIndicatorTableColumn,
  mapIndicatorTableColumns,
  getIndicatorTableColumns,
  getIndicatorTableData,
};
