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
import { gotoPrescription, createPrescription } from '../navigation/actions';

import { PageButton, SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';
import { ROUTES } from '../navigation/constants';

export const Prescriptions = ({
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
  onNewPrescription,
}) => {
  useNavigationFocus(refreshData, navigation);
  useSyncListener(refreshData, ['Transaction']);

  const onNavigateToPrescription = useCallback(prescription => {
    dispatch(gotoPrescription(prescription));
  }, []);

  const onCreatePrescription = otherParty => {
    dispatch(createPrescription(otherParty, currentUser));
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
      case MODAL_KEYS.SELECT_PATIENT:
        return onCreatePrescription;
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
          onPress={onNavigateToPrescription}
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
          <PageButton text={buttonStrings.new_invoice} onPress={onNewPrescription} />
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
  ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.PRESCRIPTIONS),
  refreshData: () => dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.PRESCRIPTIONS)),
  onFilterData: value =>
    dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.PRESCRIPTIONS)),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { prescriptions } = pages;
  return prescriptions;
};

export const PrescriptionsPage = connect(mapStateToProps, mapDispatchToProps)(Prescriptions);

Prescriptions.defaultProps = {
  showFinalised: false,
};

Prescriptions.propTypes = {
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
  onNewPrescription: PropTypes.func.isRequired,
};
