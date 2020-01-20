import { UIDatabase } from '..';
import { createRecord } from './createRecord';

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
  const rowColumnValues = UIDatabase.objects('IndicatorValue')
    .filtered('row.id = $0 AND column.id = $1 AND period.id = $2', row.id, column.id, period.id)
    .slice();
  const [rowColumnValue] = rowColumnValues;
  return rowColumnValue ?? createIndicatorValue(row, column, period);
};

/**
 * Find indicator row by id.
 * @param {Array.<IndicatorAttribute} indicatorRows
 * @param {string} rowId
 * @return {IndicatorAttribute}
 */
const getIndicatorRow = (indicatorRows, rowId) => indicatorRows.find(({ id }) => id === rowId);

/**
 * Find indicator column by code.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 * @param {string} columnCode
 * @return {IndicatorAttribute}
 */
const getIndicatorColumn = (indicatorColumns, columnCode) =>
  indicatorColumns.find(({ code }) => code === columnCode);

export {
  createIndicatorValue,
  updateIndicatorValue,
  getPeriodIndicatorValues,
  getRowColumnIndicatorValue,
  getIndicatorRow,
  getIndicatorColumn,
};
