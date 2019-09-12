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
import { usePageReducer } from '../hooks';
import { createSupplierRequisition, gotoSupplierRequisition } from '../navigation/actions';
import {
  selectRow,
  deselectRow,
  deselectAll,
  deleteRequisitions,
  sortData,
  filterData,
  openModal,
  closeModal,
  getItemLayout,
  recordKeyExtractor,
} from './dataTableUtilities';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import { buttonStrings, modalStrings } from '../localization';

const initialiseState = () => {
  const backingData = UIDatabase.objects('RequestRequisition');
  const data = newSortDataBy(backingData.slice(), 'serialNumber');
  return {
    backingData,
    data,
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber', 'otherStoreName.name'],
    sortBy: 'serialNumber',
    isAscending: true,
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
 */
export const SupplierRequisitionsPage = ({ routeName, currentUser, dispatch: reduxDispatch }) => {
  const [state, dispatch, debouncedDispatch] = usePageReducer(routeName, {}, initialiseState);

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    hasSelection,
    searchTerm,
  } = state;

  const usingPrograms = useMemo(() => getAllPrograms(Settings, UIDatabase).length > 0, []);
  const { SELECT_SUPPLIER, PROGRAM_REQUISITION } = MODAL_KEYS;
  const NEW_REQUISITON = usingPrograms ? PROGRAM_REQUISITION : SELECT_SUPPLIER;

  const onPressRow = rowData => () => reduxDispatch(gotoSupplierRequisition(rowData));
  const onConfirmDelete = () => dispatch(deleteRequisitions());
  const onCancelDelete = () => dispatch(deselectAll());
  const onSearchFiltering = value => dispatch(filterData(value));
  const onNewRequisition = () => dispatch(openModal(NEW_REQUISITON));
  const onCloseModal = () => dispatch(closeModal());

  const onCreateRequisition = otherStoreName => {
    reduxDispatch(createSupplierRequisition({ otherStoreName, currentUser }));
    onCloseModal();
  };

  const onCreateProgramRequisition = requisitionParameters => {
    reduxDispatch(createSupplierRequisition({ ...requisitionParameters, currentUser }));
    dispatch(closeModal());
  };

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
          onPress={onPressRow(item)}
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
        sortAction={sortData}
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
    searchBar,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          <SearchBar
            onChangeText={onSearchFiltering}
            style={searchBar}
            color={SUSSOL_ORANGE}
            value={searchTerm}
            placeholder=""
          />
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
};

SupplierRequisitionsPage.propTypes = { routeName: PropTypes.string.isRequired };
