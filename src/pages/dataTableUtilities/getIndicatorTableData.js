/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { COLUMN_TYPES } from './constants';
import { getRowColumnIndicatorValue } from '../../database/utilities/getIndicatorData';

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
    const value = getRowColumnIndicatorValue(row, column, period);
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
const mapIndicatorTableRows = (rows, period) => {
  console.log(period);
  const tableRows = rows.map(row => mapIndicatorTableRow(row, period));
  console.log(tableRows);
  return tableRows;
};

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
const mapIndicatorTableColumn = (column, isEditable) => {
  const tableColumn = isEditable ? COLUMN_INDICATOR_MUTABLE : COLUMN_INDICATOR_IMMUTABLE;
  const { description: title, code: key } = column;
  return {
    ...tableColumn,
    title,
    key,
  };
};

/**
 * Map indicator columns to data table column objects.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 * @oaram {bool} isEditable
 * @return {Array.<object>}
 */
const mapIndicatorTableColumns = (indicatorColumns, isEditable) => {
  const valueColumns = indicatorColumns.map(column => mapIndicatorTableColumn(column, isEditable));
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
  mapIndicatorTableRow,
  mapIndicatorTableRows,
  getIndicatorTableRows,
  mapIndicatorTableColumn,
  mapIndicatorTableColumns,
  getIndicatorTableColumns,
  getIndicatorTableData,
};
