/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase, createRecord } from '../database';

const COLUMN_WIDTH = 1;
const COLUMN_SORTABLE = false;
const COLUMN_EDITABLE = false;

const COLUMNS = {
  DESCRIPTION: {
    title: 'Description',
    key: 'description',
    type: 'string',
    width: COLUMN_WIDTH,
    sortable: COLUMN_SORTABLE,
    editable: COLUMN_EDITABLE,
  },
  CODE: {
    title: 'Code',
    key: 'code',
    type: 'string',
    width: COLUMN_WIDTH,
    sortable: COLUMN_SORTABLE,
    editable: COLUMN_EDITABLE,
  },
};

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
 * @return {IndicatorValue}
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

// eslint-disable-next-line no-unused-vars
const getIndicatorTableColumns = (indicator, period) => {
  const descriptionColumn = COLUMNS.DESCRIPTION;
  const codeColumn = COLUMNS.CODE;
  // eslint-disable-next-line no-unused-vars
  const valueColumns = indicator.columns.map(({ description, code, valueType }) => ({
    title: description,
    key: description,
    type: valueType,
    width: COLUMN_WIDTH,
    sortable: COLUMN_SORTABLE,
    editable: COLUMN_EDITABLE,
  }));

  return [descriptionColumn, codeColumn, ...valueColumns];
};
