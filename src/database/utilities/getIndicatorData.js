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
    indicatorValue.value = value;
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
const getIndicatorRowColumnValue = (row, column, period) => {
  const rowColumnValues = UIDatabase.objects('IndicatorValue')
    .filtered('row.id = $0 AND column.id = $1 AND period.id = $2', row.id, column.id, period.id)
    .slice();
  const [rowColumnValue] = rowColumnValues;
  return rowColumnValue ?? createIndicatorValue(row, column, period);
};

/**
 * Get all indicator values for a given period.
 * @param {Period} period
 */
const getIndicatorValuesByPeriod = period => {
  const indicatorValues = UIDatabase.objects('IndicatorValue').filtered(
    'period.id == $0',
    period.id
  );
  return indicatorValues;
};

/**
 * Find indicator row by id.
 * @param {Realm.Results.<IndicatorAttribute} indicatorRows
 * @param {string} rowId
 * @return {IndicatorAttribute}
 */
const getIndicatorRow = (indicatorRows, rowId) => {
  const [indicatorRow] = indicatorRows.filtered('id == $0', rowId).slice();
  return indicatorRow;
};

/**
 * Find indicator column by code.
 * @param {Realm.Results.<IndicatorAttribute>} indicatorColumns
 * @param {string} columnCode
 * @return {IndicatorAttribute}
 */
const getIndicatorColumn = (indicatorColumns, columnCode) => {
  const [indicatorColumn] = indicatorColumns.filtered('code == $0', columnCode).slice();
  return indicatorColumn;
};

/**
 * Map result set of indicator values to set of parent indicators.
 * @param {Realm.Results.<IndicatorValue>} indicatorValues
 */
const getIndicatorsByValues = indicatorValues => {
  const indicatorIds = indicatorValues.reduce(
    (acc, { indicator }) =>
      acc.some(indicatorId => indicatorId === indicator.id) ? acc : [...acc, indicator.id],
    []
  );
  const query = indicatorIds.map(indicatorId => `id == "${indicatorId}"`).join(' OR ');
  return query ? UIDatabase.objects('ProgramIndicator').filtered(query) : [];
};

export {
  createIndicatorValue,
  updateIndicatorValue,
  getIndicatorRowColumnValue,
  getIndicatorValuesByPeriod,
  getIndicatorRow,
  getIndicatorColumn,
  getIndicatorsByValues,
};
