/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { MODAL_KEYS } from '../utilities';
import { buttonStrings, modalStrings } from '../localization';
import { UIDatabase } from '../database';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import {
  sortData,
  filterData,
  openBasicModal,
  selectRow,
  deselectRow,
  deselectAll,
  closeBasicModal,
} from './dataTableUtilities/actions';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

const keyExtractor = item => item.id;

export const SupplierRequisitionsPage = ({ routeName }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    backingData: UIDatabase.objects('RequestRequisition'),
    data: UIDatabase.objects('RequestRequisition')
      .sorted('serialNumber')
      .slice(),
    keyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortBy: 'serialNumber',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
  });

  const { data, dataState, sortBy, isAscending, columns, modalKey, hasSelection } = state;

  const { SELECT_SUPPLIER } = MODAL_KEYS;

  const getItemLayout = useCallback((_, index) => {
    const { height } = newDataTableStyles.row;
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      default:
        return null;
    }
  });

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      const { row, alternateRow } = newDataTableStyles;
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          style={index % 2 === 0 ? alternateRow : row}
          columns={columns}
          dispatch={dispatch}
          getAction={getAction}
        />
      );
    },
    [data, dataState]
  );

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_item}
          onPress={() => dispatch(openBasicModal(SELECT_SUPPLIER))}
        />
      </View>
    );
  };

  const getModalOnSelect = () => null;

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const {
    newPageTopSectionContainer,
    newPageTopLeftSectionContainer,
    newPageTopRightSectionContainer,
    searchBar,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          <SearchBar
            onChange={value => debouncedDispatch(filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
          />
        </View>
        <View style={newPageTopRightSectionContainer}>{renderButtons()}</View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={null}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeBasicModal())}
        confirmAction={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

SupplierRequisitionsPage.propTypes = { routeName: PropTypes.string.isRequired };
