/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { DataTablePageView } from '..';
import { UIDatabase } from '../../database';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../DataTable';
import { getColumns, getItemLayout } from '../../pages/dataTableUtilities';

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'UPDATE': {
      const { data, customData } = state;
      const { value, rowKey, field } = payload;

      // Find the index and object to edit.
      const indexToEdit = data.findIndex(datum => datum.code === rowKey);
      const objectToEdit = data[indexToEdit];

      // Create a new object that has been edited and customData for updating.
      data[indexToEdit] = { ...objectToEdit, [field]: value };
      const newCustomData = { ...customData, regimenData: data };

      return { ...state, customData: newCustomData, data: [...data] };
    }
    default:
      return state;
  }
};

const actions = {
  updateValue: (value, rowKey) => ({
    type: 'UPDATE',
    payload: { rowKey, value, field: 'value' },
  }),
  updateComment: (value, rowKey) => ({
    type: 'UPDATE',
    payload: { rowKey, value, field: 'comment' },
  }),
};

const stateInitialiser = requisition => ({
  requisition,
  customData: requisition.parsedCustomData,
  data: requisition.parsedCustomData.regimenData,
  keyExtractor: item => item.code,
  columns: getColumns('regimenDataModal'),
});

/**
 * Renders page to be displayed in StocktakeEditPage -> expansion.
 *
 * @prop {Object} requisition Requisition with regimen data to edit.
 */
export const RegimenDataModal = ({ requisition }) => {
  const [state, dispatch] = useReducer(reducer, requisition, stateInitialiser);

  const { data, keyExtractor, columns, customData } = state;
  const { isFinalised } = requisition;

  useEffect(() => {
    UIDatabase.write(() => {
      requisition.saveCustomData(customData);
    });
  }, [customData]);

  const updateComment = (value, rowKey) => dispatch(actions.updateComment(value, rowKey));
  const updateValue = (value, rowKey) => dispatch(actions.updateValue(value, rowKey));

  const getCallback = columnKey => {
    switch (columnKey) {
      default:
      case 'comment':
        return updateComment;
      case 'value':
        return updateValue;
    }
  };

  const renderRow = listItem => {
    const { item, index } = listItem;
    const rowKey = item.code;
    return (
      <DataTableRow
        rowData={data[index]}
        rowKey={rowKey}
        columns={columns}
        isFinalised={isFinalised}
        getCallback={getCallback}
        rowIndex={index}
      />
    );
  };

  const renderHeader = useCallback(() => <DataTableHeaderRow columns={columns} />, []);

  return (
    <DataTablePageView>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
        windowSize={1}
        initialNumToRender={0}
      />
    </DataTablePageView>
  );
};

RegimenDataModal.propTypes = {
  requisition: PropTypes.object.isRequired,
};
