/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';
import { useNavigationFocus, useSyncListener } from '../hooks';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';
import { gotoCustomerInvoice, createCustomerInvoice } from '../navigation/actions';

import { PageButton, SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';
import { ROUTES } from '../navigation/constants';

export const CustomerInvoices = ({
  currentUser,
  navigation,
  dispatch,
  data,
  dataState,
  sortBy,
  isAscending,
  modalKey,
  hasSelection,
  keyExtractor,
  searchTerm,
  columns,
  showFinalised,
  refreshData,
  onFilterData,
  onDeselectAll,
  onDeleteRecords,
  onCloseModal,
  toggleFinalised,
  onCheck,
  onUncheck,
  onSortColumn,
  onNewCustomerInvoice,
}) => {
  // Listen to changes from sync and navigation events re-focusing this screen,
  // such that any side effects that occur trigger a reconcilitation of data.
  useNavigationFocus(refreshData, navigation);
  useSyncListener(refreshData, ['Transaction']);

  const onNavigateToInvoice = useCallback(invoice => dispatch(gotoCustomerInvoice(invoice)), []);

  const onCreateInvoice = otherParty => {
    dispatch(createCustomerInvoice(otherParty, currentUser));
    onCloseModal();
  };

  const toggles = useMemo(
    () => [
      { text: buttonStrings.current, onPress: toggleFinalised, isOn: !showFinalised },
      { text: buttonStrings.past, onPress: toggleFinalised, isOn: showFinalised },
    ],
    [showFinalised]
  );

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_CUSTOMER:
        return onCreateInvoice;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          getCallback={getCallback}
          rowIndex={index}
          onPress={onNavigateToInvoice}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        onPress={onSortColumn}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <ToggleBar toggles={toggles} />
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton text={buttonStrings.new_invoice} onPress={onNewCustomerInvoice} />
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
        onCancel={onDeselectAll}
        onConfirm={onDeleteRecords}
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.CUSTOMER_INVOICES),
  refreshData: () => dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.CUSTOMER_INVOICES)),
  onFilterData: value =>
    dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.CUSTOMER_INVOICES)),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { customerInvoices } = pages;
  return customerInvoices;
};

export const CustomerInvoicesPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerInvoices);

CustomerInvoices.defaultProps = {
  showFinalised: false,
};

CustomerInvoices.propTypes = {
  currentUser: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  showFinalised: PropTypes.bool,
  refreshData: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onDeleteRecords: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  toggleFinalised: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onNewCustomerInvoice: PropTypes.func.isRequired,
};
