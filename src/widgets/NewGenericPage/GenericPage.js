/**
 * Table experiment hole
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import { View, KeyboardAwareScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DataTable, { Row, Cell, EditableCell, CheckableCell } from './DataTable';

const keyExtractor = item => item.id;

// Reducer for managing DataTable state
const reducer = (state, action) => {
  /**
   * Immutably clears the current focus
   * @param {object} currState  the copy of state you want affected
   * @return {object}           A new object with no cell focused
   */
  const clearFocus = currState => {
    const { dataState, currentFocusedRowKey } = currState;
    if (!currentFocusedRowKey) {
      return currState;
    }

    const newDataState = new Map(dataState);
    const currentRowState = newDataState.get(currentFocusedRowKey);
    newDataState.set(currentFocusedRowKey, {
      ...currentRowState,
      focusedColumn: null,
    });

    return { ...currState, dataState: newDataState, currentFocusedRowKey: null };
  };

  /**
   * Immutably sets the current focus to the cell identified by `rowKey` and `columnKey`
   * @param {object} currState  The copy of state to affect
   * @param {string} rowKey     The key of the row the cell to focus is in
   * @param {string} columnKey  The key of the column the cell to focus is in
   * @return {object}           A new object with a cell focused
   */
  const setFocus = (currState, rowKey, columnKey) => {
    const { dataState, currentFocusedRowKey } = currState;
    const newDataState = new Map(dataState);

    // Clear previous focus if in a different row
    if (currentFocusedRowKey && rowKey !== currentFocusedRowKey) {
      const currentRowState = newDataState.get(currentFocusedRowKey);
      newDataState.set(currentFocusedRowKey, {
        ...currentRowState,
        focusedColumn: null,
      });
    }

    // Update focusedColumn in specified row
    const nextRowState = newDataState.get(rowKey);
    newDataState.set(rowKey, {
      ...nextRowState,
      focusedColumn: columnKey,
    });

    return {
      ...currState,
      dataState: newDataState,
      currentFocusedRowKey: rowKey,
    };
  };

  switch (action.type) {
    case 'editCell': {
      const { value, rowKey, columnKey } = action;
      const { data } = state;
      const rowIndex = data.findIndex(row => keyExtractor(row) === rowKey);

      // Immutable array editing so only the row/cell edited are re-rendered.
      // If you don't do this, every row will re-render as well as the cell
      // edited.
      const newData = data.map((row, index) => {
        if (index !== rowIndex) {
          return row;
        }
        const rowEdited = { ...row };
        rowEdited[columnKey] = value;
        return rowEdited;
      });
      return { ...state, data: newData };
    }
    case 'reverseData':
      return { ...state, data: state.data.reverse() };
    case 'focusCell': {
      // Clear any existing focus and focus cell specified in action
      const { rowKey, columnKey } = action;
      return setFocus(state, rowKey, columnKey);
    }
    case 'focusNextCell': {
      const { data, columns } = state;
      const { rowKey, columnKey } = action;

      // Handle finding next cell to focus
      let nextEditableColKey;
      const currentColIndex = columns.findIndex(col => col.key === columnKey);
      for (let index = currentColIndex + 1; index < columns.length; index++) {
        if (columns[index].type === 'editable') {
          nextEditableColKey = columns[index].key;
          break;
        }
      }

      if (nextEditableColKey) {
        // Focus next editable cell in row
        return setFocus(state, rowKey, nextEditableColKey);
      }

      // Attempt moving focus to next row
      const nextRowIndex = data.findIndex(row => keyExtractor(row) === rowKey) + 1;

      if (nextRowIndex < data.length) {
        // Focus first editable cell in next row
        const nextRowKey = keyExtractor(data[nextRowIndex]);
        const firstEditableColKey = columns.find(col => col.type === 'editable').key;
        return setFocus(state, nextRowKey, firstEditableColKey);
      }

      // We were on the last row and last column, so unfocus current cell
      return clearFocus(state);
    }
    case 'selectRow': {
      const { dataState } = state;
      const { rowKey } = action;
      const newDataState = new Map(dataState);

      const nextRowState = newDataState.get(rowKey);
      newDataState.set(rowKey, {
        ...nextRowState,
        isSelected: true,
      });

      return { ...state, dataState: newDataState };
    }
    case 'deselectRow': {
      const { dataState } = state;
      const { rowKey } = action;
      const newDataState = new Map(dataState);

      const nextRowState = newDataState.get(rowKey);
      newDataState.set(rowKey, {
        ...nextRowState,
        isSelected: false,
      });

      return { ...state, dataState: newDataState };
    }
    default:
      return state;
  }
};

// Actions
const editCell = (value, rowKey, columnKey) => ({
  type: 'editCell',
  value,
  rowKey,
  columnKey,
});

const focusCell = (rowKey, columnKey) => ({
  type: 'focusCell',
  rowKey,
  columnKey,
});

const focusNext = (rowKey, columnKey) => ({
  type: 'focusNextCell',
  rowKey,
  columnKey,
});

const selectRow = rowKey => ({
  type: 'selectRow',
  rowKey,
});

const deselectRow = rowKey => ({
  type: 'deselectRow',
  rowKey,
});

const GenericPage = ({
  children,
  data,
  refreshData,
  renderCell,
  renderTopLeftComponent,
  renderTopRightComponent,
  onSelectionChange,
  onEndEditing,
  defaultSortKey,
  defaultSortDirection,
  columns,
  dataTypesSynchronised,
  finalisableDataType,
  database,
  selection,
  pageStyles,
  topRoute,
}) => {
  const [state, dispatch] = useReducer(reducer, baseState);
  const { data, dataState, columns } = state;

  const CheckedComponent = () => (
    <Icon name="md-radio-button-on" size={15} color={colors.checkableCellChecked} />
  );
  const UncheckedComponent = () => (
    <Icon name="md-radio-button-off" size={15} color={colors.checkableCellUnchecked} />
  );
  const DisabledCheckedComponent = () => (
    <Icon name="md-radio-button-on" size={15} color={colors.checkableCellDisabled} />
  );
  const DisabledUncheckedComponent = () => (
    <Icon name="md-radio-button-off" size={15} color={colors.checkableCellDisabled} />
  );

  const renderCells = useCallback(
    (rowData, rowState = {}, rowKey) =>
      columns.map(column => {
        const { key: colKey, type } = column;
        switch (type) {
          case 'editable':
            return (
              <EditableCell
                key={colKey}
                value={rowData[colKey]}
                rowKey={rowKey}
                columnKey={colKey}
                editAction={editCell}
                isFocused={colKey === rowState.focusedColumn}
                disabled={rowState.disabled}
                focusAction={focusCell}
                focusNextAction={focusNext}
                dispatch={dispatch}
              />
            );
          case 'checkable':
            return (
              <CheckableCell
                key={colKey}
                rowKey={rowKey}
                columnKey={colKey}
                isChecked={rowState.isSelected}
                disabled={rowState.disabled}
                CheckedComponent={CheckedComponent}
                UncheckedComponent={UncheckedComponent}
                DisabledCheckedComponent={DisabledCheckedComponent}
                DisabledUncheckedComponent={DisabledUncheckedComponent}
                onCheckAction={selectRow}
                onUncheckAction={deselectRow}
                dispatch={dispatch}
              />
            );
          default:
            return <Cell key={colKey} value={rowData[colKey]} />;
        }
      }),
    [columns]
  );

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <Row
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          renderCells={renderCells}
        />
      );
    },
    [data, dataState, renderCells]
  );

  return (
    <View style={[defaultStyles.pageContentContainer, pageStyles.pageContentContainer]}>
      <View style={[defaultStyles.container, pageStyles.container]}>
        <View style={[defaultStyles.pageTopSectionContainer, pageStyles.pageTopSectionContainer]}>
          {(searchKey || refreshData || renderTopLeftComponent) && (
            <View
              style={[
                defaultStyles.pageTopLeftSectionContainer,
                pageStyles.pageTopLeftSectionContainer,
              ]}
            >
              {renderTopLeftComponent && renderTopLeftComponent()}
              {(searchKey || refreshData) && renderSearchBar()}
            </View>
          )}
          {renderTopRightComponent && (
            <View
              style={[
                defaultStyles.pageTopRightSectionContainer,
                pageStyles.pageTopRightSectionContainer,
              ]}
            >
              {renderTopRightComponent()}
            </View>
          )}
        </View>
        <DataTable
          data={data}
          extraData={state}
          renderRow={renderRow}
          keyExtractor={keyExtractor}
        />
        {children}
      </View>
    </View>
  );
};

export default GenericPage;

GenericPage.propTypes = {
  children: PropTypes.any,
  colors: PropTypes.object,
  columns: PropTypes.array,
  data: PropTypes.any,
  dataTableStyles: PropTypes.object,
  defaultSortDirection: PropTypes.string,
  defaultSortKey: PropTypes.string,
  footerData: PropTypes.object,
  onEndEditing: PropTypes.func,
  onRowPress: PropTypes.func,
  onSelectionChange: PropTypes.func,
  pageStyles: PropTypes.object,
  refreshData: PropTypes.func,
  renderCell: PropTypes.func,
  renderExpansion: PropTypes.func,
  renderTopLeftComponent: PropTypes.func,
  renderTopRightComponent: PropTypes.func,
  renderDataTableFooter: PropTypes.func,
  rowHeight: PropTypes.number,
  searchBarColor: PropTypes.string,
  searchBarPlaceholderText: PropTypes.string,
  searchKey: PropTypes.string,
  selection: PropTypes.array,
  isDataCircular: PropTypes.bool,
  hideSearchBar: PropTypes.bool,
};

GenericPage.defaultProps = {
  children: null,
  colors: null,
  columns: null,
  data: null,
  dataTableStyles: null,
  defaultSortDirection: null,
  defaultSortKey: null,
  footerData: null,
  onEndEditing: null,
  onRowPress: null,
  onSelectionChange: null,
  pageStyles: null,
  refreshData: null,
  renderCell: null,
  renderExpansion: null,
  renderTopLeftComponent: null,
  renderTopRightComponent: null,
  renderDataTableFooter: null,
  rowHeight: null,
  searchBarColor: null,
  searchBarPlaceholderText: null,
  searchKey: null,
  selection: null,
  isDataCircular: null,
  hideSearchBar: null,
};

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
  },
  pageContentContainer: {
    flex: 1,
  },
  pageTopSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageTopLeftSectionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: 500,
  },
  pageTopRightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  listView: {
    flex: 1,
  },
  alignTextLeft: {
    marginLeft: 20,
    textAlign: 'left',
  },
  alignTextCenter: {
    textAlign: 'center',
  },
  alignTextRight: {
    marginRight: 20,
    textAlign: 'right',
  },
});
