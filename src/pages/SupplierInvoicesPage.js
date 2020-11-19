/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';
import { useNavigationFocus, useSyncListener } from '../hooks';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';
import { gotoSupplierInvoice, createSupplierInvoice } from '../navigation/actions';
import { selectCurrentUser } from '../selectors/user';

import { PageButton, SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { DataTablePageModal } from '../widgets/modals';
import { BottomConfirmModal } from '../widgets/bottomModals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings, generalStrings } from '../localization';
import globalStyles from '../globalStyles';
import { ROUTES } from '../navigation/constants';

export const SupplierInvoices = ({
  currentUser,
  navigation,
  dispatch,
  data,
  dataState,
  sortKey,
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
  route,
}) => {
  // Listen to changes from sync and navigation events re-focusing this screen,
  // such that any side effects that occur trigger a reconcilitation of data.
  useNavigationFocus(navigation, refreshData);
  useSyncListener(refreshData, ['Transaction']);

  const onNewInvoice = () =>
    dispatch(PageActions.openModal(MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER, route));

  const onNavigateToInvoice = useCallback(invoice => {
    dispatch(gotoSupplierInvoice(invoice));
    onDeselectAll();
  }, []);

  const onCreateInvoice = otherParty => {
    dispatch(createSupplierInvoice(otherParty, currentUser));
    onDeselectAll();
    onCloseModal();
  };

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
      case MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER:
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
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const toggles = useMemo(
    () => [
      { text: buttonStrings.current, onPress: toggleFinalised, isOn: !showFinalised },
      { text: buttonStrings.past, onPress: toggleFinalised, isOn: showFinalised },
    ],
    [showFinalised]
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
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.invoice_number} ${generalStrings.or} ${generalStrings.supplier}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton text={buttonStrings.new_invoice} onPress={onNewInvoice} />
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
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = dispatch => ({
  ...getPageDispatchers(dispatch, 'Transaction', ROUTES.SUPPLIER_INVOICES),
  onFilterData: value =>
    dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.SUPPLIER_INVOICES)),
  refreshData: () => dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.SUPPLIER_INVOICES)),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { supplierInvoices } = pages;
  const currentUser = selectCurrentUser(state);

  return { ...supplierInvoices, currentUser };
};

export const SupplierInvoicesPage = connect(mapStateToProps, mapDispatchToProps)(SupplierInvoices);

SupplierInvoices.defaultProps = {
  showFinalised: false,
};

SupplierInvoices.propTypes = {
  currentUser: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
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
  route: PropTypes.string.isRequired,
};
