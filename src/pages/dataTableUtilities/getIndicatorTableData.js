/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { COLUMN_TYPES } from './constants';
import { getIndicatorRowColumnValue } from '../../database/utilities/getIndicatorData';

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
 * @param {Array.<IndicatorAttribute>} rows
 * @param {ProgramIndicator} indicator
 * @param {Period} period
 * @return {object}
 */
const mapIndicatorTableRows = (rows, period, searchTerm) => {
  const filteredRows = rows.filtered(
    'description CONTAINS[c] $0 OR code CONTAINS[c] $0',
    searchTerm
  );
  return filteredRows.map(row => {
    const { id, description, code, indicator } = row;
    const values = indicator.columns.reduce((acc, column) => {
      const { code: key } = column;
      const value = getIndicatorRowColumnValue(row, column, period);
      return { ...acc, [key]: value.value };
    }, {});
    return { id, description, code, ...values };
  });
};

/**
 * Map indicator columns to data table column objects.
 * @param {Array.<IndicatorAttribute>} indicatorColumns
 * @oaram {bool} isEditable
 * @return {Array.<object>}
 */
const mapIndicatorTableColumns = (indicatorColumns, isEditable) => {
  const valueColumns = indicatorColumns.map(column => {
    const tableColumn = isEditable ? COLUMN_INDICATOR_MUTABLE : COLUMN_INDICATOR_IMMUTABLE;
    const { description: title, code: key } = column;
    return {
      ...tableColumn,
      title,
      key,
    };
  });
  return [COLUMNS.DESCRIPTION, COLUMNS.CODE, ...valueColumns];
};

export { mapIndicatorTableRows, mapIndicatorTableColumns };
