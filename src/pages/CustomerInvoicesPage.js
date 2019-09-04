/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { UIDatabase, createRecord } from '../database';
import { buttonStrings, modalStrings, navStrings } from '../localization';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities/utilities';
import { BottomConfirmModal, SelectModal } from '../widgets/modals';
import {
  PageButton,
  CheckedComponent,
  UncheckedComponent,
  DisabledCheckedComponent,
  DisabledUncheckedComponent,
} from '../widgets';
import { DataTable, Row, Cell, CheckableCell, DataTableHeaderRow } from '../widgets/DataTable';
import {
  selectRow,
  deselectRow,
  deselectAll,
  sortData,
  filterData,
  openBasicModal,
  closeBasicModal,
  deleteTransactionsById,
} from './dataTableUtilities/actions';
import { MODAL_KEYS, newSortDataBy } from '../utilities';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

import { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';

const initialState = () => {
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

export const CustomerInvoicesPage = ({ currentUser, navigateTo, routeName }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(
    routeName,
    initialState()
  );
  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    hasSelection,
    keyExtractor,
  } = state;

  const renderNewInvoiceButton = () => (
    <PageButton
      text={buttonStrings.new_invoice}
      onPress={() => dispatch(openBasicModal(MODAL_KEYS.SELECT_CUSTOMER))}
    />
  );

  const navigateToInvoice = invoice => {
    // For a customer invoice to be opened for editing in the customer invoice page, it must be
    // confirmed. If this is not enforced, it is possible for a particular item being issued
    // across multiple invoices in larger quantities than are available.

    // Customer invoices are generally created with the status confirmed. This handles unexpected
    // cases of an incoming sycned invoice with status 'nw' or 'sg'.
    if (!invoice.isConfirmed && !invoice.isFinalised) {
      UIDatabase.write(() => {
        invoice.confirm(UIDatabase);
        UIDatabase.save('Transaction', invoice);
      });
    }
    navigateTo('customerInvoice', `${navStrings.invoice} ${invoice.serialNumber}`, {
      transaction: invoice,
    });
  };

  const onNewInvoice = otherParty => {
    let invoice;
    UIDatabase.write(() => {
      invoice = createRecord(UIDatabase, 'CustomerInvoice', otherParty, currentUser);
    });
    navigateToInvoice(invoice);
  };

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const renderCells = useCallback((rowData, rowState = {}, rowKey) => {
    const { cellContainer, cellText, touchableCellContainer } = newDataTableStyles;
    return columns.map(({ key: colKey, type, width, alignText }, index) => {
      const isLastCell = index === columns.length - 1;
      const isDisabled = rowData.isFinalised;
      switch (type) {
        case 'checkable':
          return (
            <CheckableCell
              key={colKey}
              rowKey={rowKey}
              columnKey={colKey}
              isChecked={rowState && rowState.isSelected}
              isDisabled={isDisabled}
              CheckedComponent={CheckedComponent}
              UncheckedComponent={UncheckedComponent}
              DisabledCheckedComponent={DisabledCheckedComponent}
              DisabledUncheckedComponent={DisabledUncheckedComponent}
              onCheckAction={selectRow}
              onUncheckAction={deselectRow}
              dispatch={dispatch}
              containerStyle={touchableCellContainer}
              width={width}
              isLastCell={isLastCell}
              debug
            />
          );
        default:
          return (
            <Cell
              key={colKey}
              value={rowData[colKey]}
              width={width}
              viewStyle={cellContainer[alignText || 'left']}
              textStyle={cellText[alignText || 'left']}
              isLastCell={isLastCell}
              debug
            />
          );
      }
    });
  }, []);

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      const { row, alternateRow } = newDataTableStyles;
      return (
        <Row
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          renderCells={renderCells}
          onPress={() => navigateToInvoice(data[index])}
          style={index % 2 === 0 ? alternateRow : row}
          debug
        />
      );
    },
    [data, dataState, renderCells]
  );

  const memoizedGetItemLayout = useCallback(getItemLayout, []);

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
        <View style={newPageTopRightSectionContainer}>{renderNewInvoiceButton()}</View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={memoizedGetItemLayout}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.delete_these_invoices}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteTransactionsById())}
        confirmText={modalStrings.delete}
      />
      <SelectModal
        isOpen={!!modalKey}
        options={UIDatabase.objects('Customer')}
        placeholderText={modalStrings.start_typing_to_select_customer}
        queryString="name BEGINSWITH[c] $0"
        sortByString="name"
        onSelect={name => onNewInvoice(name)}
        onClose={() => dispatch(closeBasicModal())}
        title={modalStrings.search_for_the_customer}
      />
    </DataTablePageView>
  );
};

export default CustomerInvoicesPage;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
CustomerInvoicesPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired,
};
