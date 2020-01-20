import { UIDatabase } from '..';
import { createRecord } from './createRecord';

/**
 * Returns a filter method for finding a subset of an array of IndicatorAttribute objects by period.
 * @param {Array.<IndicatorAttribute>} filterPeriod
 * @return {Func}
 */
const filterByPeriod = filterPeriod => ({ period }) => period.id === filterPeriod.id;

/**
 * Returns a filter method for getting the intersection of two arrays of IndicatorValue objects.
 * @param {Array.<IndicatorValue>} values
 * @return {Func}
 */
const filterByValues = values => value => includesValue(values, value);

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
const includesValue = (values, value) => values.some(findByValue(value));

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
 * Get all indicator values for a given period.
 * @param {*} period
 */
const getPeriodIndicatorValues = period =>
  UIDatabase.objects('IndicatorValue').filtered('period.id == $0', period.id);

/**
 * Get value for indicator row, column attribute pair.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 * @return {IndicatorValue}
 */
const getRowColumnIndicatorValue = (row, column, period) => {
  const rowValues = row.values.filter(filterByPeriod(period));
  console.log(row.values.map(({ id }) => id));
  console.log(period.id);
  console.log(row.id);
  console.log(column.id);
  console.log(rowValues.map(({ value }) => value));
  const columnValues = column.values.filter(filterByPeriod(period));
  const rowColumnValues = rowValues?.filter(filterByValues(columnValues));
  const [rowColumnValue] = rowColumnValues;
  return rowColumnValue; // createIndicatorValue(row, column, period);
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

export {
  createIndicatorValue,
  updateIndicatorValue,
  getRowColumnIndicatorValue,
  getPeriodIndicatorValues,
  getIndicatorRow,
  getIndicatorRows,
  getIndicatorColumn,
  getIndicatorColumns,
  getIndicatorData,
};

export default getIndicatorData;
