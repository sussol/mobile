/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { UIDatabase } from '../database';
import Settings from '../settings/MobileAppSettings';
import { MODAL_KEYS, getAllPrograms, newSortDataBy } from '../utilities';
import { usePageReducer, useNavigationFocus, useSyncListener } from '../hooks';
import { createSupplierRequisition, gotoSupplierRequisition } from '../navigation/actions';
import { getItemLayout, recordKeyExtractor } from './dataTableUtilities';

import globalStyles, { newPageStyles } from '../globalStyles';
import { buttonStrings, modalStrings } from '../localization';

const initialiseState = () => {
  const backingData = UIDatabase.objects('RequestRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber', false);
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber', 'otherStoreName.name'],
    sortBy: 'serialNumber',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
  };
};

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
 *
 * @prop {String} routeName     The current route name for the top of the navigation stack.
 * @prop {Object} currentUser   The currently logged in user.
 * @prop {Func}   reduxDispatch Dispatch method for the app-wide redux store.
 * @prop {Object} navigation    Reference to the main application stack navigator.
 */
export const SupplierRequisitionsPage = ({
  routeName,
  currentUser,
  dispatch: reduxDispatch,
  navigation,
}) => {
  const initialState = { page: routeName };
  const [state, dispatch, debouncedDispatch] = usePageReducer(initialState, initialiseState);

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    modalKey,
    hasSelection,
    searchTerm,
    PageActions,
    columns,
  } = state;

  // Custom hook to refresh data on this page when becoming the head of the stack again.
  const refreshCallback = () => dispatch(PageActions.refreshData(), []);
  useNavigationFocus(refreshCallback, navigation);
  // Custom hook to listen to sync changes - refreshing data when requisitions are synced.
  useSyncListener(refreshCallback, 'Requisition');

  const usingPrograms = useMemo(() => getAllPrograms(Settings, UIDatabase).length > 0, []);
  const { SELECT_SUPPLIER, PROGRAM_REQUISITION } = MODAL_KEYS;
  const NEW_REQUISITON = usingPrograms ? PROGRAM_REQUISITION : SELECT_SUPPLIER;

  const onPressRow = useCallback(rowData => reduxDispatch(gotoSupplierRequisition(rowData)), []);
  const onConfirmDelete = () => dispatch(PageActions.deleteRequisitions());
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onSearchFiltering = value => dispatch(PageActions.filterData(value));
  const onNewRequisition = () => dispatch(PageActions.openModal(NEW_REQUISITON));
  const onCloseModal = () => dispatch(PageActions.closeModal());

  const onCreateRequisition = otherStoreName => {
    onCloseModal();
    reduxDispatch(createSupplierRequisition({ otherStoreName, currentUser }));
  };

  const onCreateProgramRequisition = requisitionParameters => {
    onCloseModal();
    reduxDispatch(createSupplierRequisition({ ...requisitionParameters, currentUser }));
  };

  const getAction = (colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case SELECT_SUPPLIER:
        return onCreateRequisition;
      case PROGRAM_REQUISITION:
        return onCreateProgramRequisition;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = recordKeyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          dispatch={dispatch}
          getAction={getAction}
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
        dispatch={debouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const PageButtons = useCallback(() => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_requisition}
          onPress={onNewRequisition}
        />
      </View>
    );
  }, []);

  const {
    newPageTopSectionContainer,
    newPageTopLeftSectionContainer,
    newPageTopRightSectionContainer,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          <SearchBar onChangeText={onSearchFiltering} value={searchTerm} />
        </View>
        <View style={newPageTopRightSectionContainer}>
          <PageButtons />
        </View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        confirmText={modalStrings.remove}
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

SupplierRequisitionsPage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

SupplierRequisitionsPage.propTypes = { routeName: PropTypes.string.isRequired };
