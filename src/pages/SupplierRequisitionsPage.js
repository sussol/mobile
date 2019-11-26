/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { UIDatabase } from '../database';
import Settings from '../settings/MobileAppSettings';
import { MODAL_KEYS, getAllPrograms } from '../utilities';
import { ROUTES } from '../navigation/constants';
import { useNavigationFocus, useSyncListener } from '../hooks';
import { createSupplierRequisition, gotoSupplierRequisition } from '../navigation/actions';
import { getItemLayout, PageActions, getPageDispatchers } from './dataTableUtilities';

import globalStyles from '../globalStyles';
import { buttonStrings, modalStrings } from '../localization/index';

/**
 * Renders a mSupply mobile page with a list of supplier requisitions.
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from `backingData` to display in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused },
 */
export const SupplierRequisitions = ({
  currentUser,
  dispatch,
  navigation,
  data,
  dataState,
  sortKey,
  isAscending,
  modalKey,
  hasSelection,
  searchTerm,
  columns,
  showFinalised,
  keyExtractor,
  refreshData,
  onFilterData,
  onDeselectAll,
  onDeleteRecords,
  onCloseModal,
  toggleFinalised,
  onCheck,
  onUncheck,
  onSortColumn,
  onNewRequisition,
}) => {
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(navigation, refreshData);
  useSyncListener(refreshData, 'Requisition');

  const onPressRow = useCallback(rowData => dispatch(gotoSupplierRequisition(rowData)), []);

  const onCreateRequisition = otherStoreName => {
    onCloseModal();
    dispatch(createSupplierRequisition({ otherStoreName, currentUser }));
  };

  const onCreateProgramRequisition = requisitionParameters => {
    onCloseModal();
    dispatch(createSupplierRequisition({ ...requisitionParameters, currentUser }));
  };

  const getCallback = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_INTERNAL_SUPPLIER:
        return onCreateRequisition;
      case MODAL_KEYS.PROGRAM_REQUISITION:
        return onCreateProgramRequisition;
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
          onPress={onPressRow}
          rowIndex={index}
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
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton text={buttonStrings.new_requisition} onPress={onNewRequisition} />
        </View>
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
        onCancel={onDeselectAll}
        onConfirm={onDeleteRecords}
        confirmText={modalStrings.remove}
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

const mapDispatchToProps = (dispatch, ownProps) => {
  const usingPrograms = getAllPrograms(Settings, UIDatabase).length > 0;
  const newRequisitionModalKey = usingPrograms
    ? MODAL_KEYS.PROGRAM_REQUISITION
    : MODAL_KEYS.SELECT_INTERNAL_SUPPLIER;

  return {
    ...getPageDispatchers(dispatch, ownProps, 'Requisition', ROUTES.SUPPLIER_REQUISITIONS),
    onFilterData: value =>
      dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.SUPPLIER_REQUISITIONS)),
    refreshData: () =>
      dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.SUPPLIER_REQUISITIONS)),
    onNewRequisition: () =>
      dispatch(PageActions.openModal(newRequisitionModalKey, ROUTES.SUPPLIER_REQUISITIONS)),
  };
};

const mapStateToProps = state => {
  const { pages } = state;
  const { supplierRequisitions } = pages;
  return supplierRequisitions;
};

export const SupplierRequisitionsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SupplierRequisitions);

SupplierRequisitions.defaultProps = {
  showFinalised: false,
};

SupplierRequisitions.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  showFinalised: PropTypes.bool,
  modalKey: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onDeleteRecords: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  toggleFinalised: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onNewRequisition: PropTypes.func.isRequired,
};
