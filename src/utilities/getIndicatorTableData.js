/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase, createRecord } from '../database';

const COLUMN_DEFAULTS = {
  type: 'string',
  width: 1,
  sortable: false,
  editable: false,
};

const COLUMNS = {
  DESCRIPTION: {
    title: 'Description',
    key: 'description',
    ...COLUMN_DEFAULTS,
  },
  CODE: {
    title: 'Code',
    key: 'code',
    ...COLUMN_DEFAULTS,
  },
};

/**
 * Intialise a new indicator value.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @param {Period} period
 */
export const initialiseRowColumnValue = (row, column, period) => {
  UIDatabase.write(() => {
    createRecord(UIDatabase, 'IndicatorValue', row, column, period);
  });
};

/**
 * Get value for indicator row, column tuple.
 *
 * @param {IndicatorAttribute} row
 * @param {IndicatorAttribute} column
 * @returns {IndicatorValue}
 */
export const getIndicatorRowColumnValue = (row, column, period) => {
  const columnValues = column?.values?.filter(
    ({ period: valuePeriod }) => valuePeriod.ID === period.ID
  );
  const rowValues = row?.values?.filter(({ period: valuePeriod }) => valuePeriod.ID === period.ID);
  const columnValueIds = columnValues?.map(({ id }) => id);
  const rowValueIds = rowValues?.map(({ id }) => id);
  const [rowColumnValueId] = columnValueIds?.filter(id => rowValueIds.includes(id)) || [];
  const rowColumnValue = column?.values?.find(({ id }) => id === rowColumnValueId);

  if (!rowColumnValue) {
    initialiseRowColumnValue(row, column, period);
    return getIndicatorRowColumnValue(row, column, period);
  }

  return rowColumnValue;
};

/**
 * Get indicator data table columns.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {Array.<object>}
 */
// eslint-disable-next-line no-unused-vars
const getIndicatorTableColumns = (indicator, period) => {
  const descriptionColumn = COLUMNS.DESCRIPTION;
  const codeColumn = COLUMNS.CODE;
  // eslint-disable-next-line no-unused-vars
  const valueColumns = indicator.columns.map(({ description, code, valueType }) => ({
    title: description,
    key: description,
    type: valueType,
    ...COLUMN_DEFAULTS,
  }));

  return [descriptionColumn, codeColumn, ...valueColumns];
};

/**
 * Get indicator data table rows.
 *
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @returns {Array.<object>}
 */
const getIndicatorTableRows = (indicator, period) =>
  indicator.rows.map(row => {
    const { id, description, code } = row;
    const values = indicator.columns.reduce((acc, column) => {
      const { description: key } = column;
      const value = getIndicatorRowColumnValue(row, column, period);
      return { ...acc, [key]: value.value };
    }, {});
    return { id, description, code, ...values };
  });

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

export { getIndicatorTableData };
