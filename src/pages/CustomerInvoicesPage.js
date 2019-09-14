/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { UIDatabase } from '../database';
import { MODAL_KEYS, newSortDataBy } from '../utilities';
import { usePageReducer, useNavigationFocus } from '../hooks';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';
import { gotoCustomerInvoice, createCustomerInvoice } from '../navigation/actions';

import { PageButton, SearchBar, DataTablePageView } from '../widgets';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import {
  selectRow,
  deselectRow,
  deselectAll,
  deleteTransactions,
} from './dataTableUtilities/actions/rowActions';
import { sortData, filterData } from './dataTableUtilities/actions/tableActions';
import { openModal, closeModal } from './dataTableUtilities/actions/pageActions';

import { buttonStrings, modalStrings } from '../localization';
import { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';

const initializer = () => {
  const backingData = UIDatabase.objects('CustomerInvoice');
  return {
    backingData,
    data: newSortDataBy(backingData.slice(), 'serialNumber', false),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['otherParty.name'],
    sortBy: 'serialNumber',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
  };
};

export const CustomerInvoicesPage = ({
  currentUser,
  routeName,
  navigation,
  dispatch: reduxDispatch,
}) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(routeName, {}, initializer);
  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    hasSelection,
    keyExtractor,
    searchTerm,
  } = state;

  // Refresh data on navigating back to this page.
  useNavigationFocus(dispatch, navigation);

  // On Press Handlers
  const onCloseModal = () => dispatch(closeModal());
  const onFilterData = value => dispatch(filterData(value));
  const onNewInvoice = () => dispatch(openModal(MODAL_KEYS.SELECT_CUSTOMER));
  const onRemoveInvoices = () => dispatch(deleteTransactions());
  const onCancelRemoval = () => dispatch(deselectAll());
  // Method is memoized in DataTableRow component - cannot memoize the returned closure.
  const onNavigateToInvoice = invoice => () => reduxDispatch(gotoCustomerInvoice(invoice));

  const getAction = (colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_CUSTOMER:
        return otherParty => {
          reduxDispatch(createCustomerInvoice(otherParty, currentUser));
          onCloseModal();
        };
      default:
        return null;
    }
  };

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        dispatch={instantDebouncedDispatch}
        sortAction={sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

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
          rowIndex={index}
          onPress={onNavigateToInvoice(item)}
        />
      );
    },
    [data, dataState]
  );

  const NewInvoiceButton = () => (
    <PageButton text={buttonStrings.new_invoice} onPress={onNewInvoice} />
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
            onChangeText={onFilterData}
            color={SUSSOL_ORANGE}
            value={searchTerm}
            style={searchBar}
          />
        </View>
        <View style={newPageTopRightSectionContainer}>
          <NewInvoiceButton />
        </View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.delete_these_invoices}
        onCancel={onCancelRemoval}
        onConfirm={onRemoveInvoices}
        confirmText={modalStrings.delete}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

export default CustomerInvoicesPage;

CustomerInvoicesPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
