/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, PageButton, PageInfo, ToggleBar, SearchBar } from '../widgets';

import {
  selectRow,
  deselectRow,
  deselectAll,
  deleteRequisitionItems,
  filterData,
  sortData,
  addMasterListItems,
  addRequisitionItem,
  createAutomaticOrder,
  setRequestedToSuggested,
  hideOverStocked,
  showOverStocked,
  editComment,
  openModal,
  closeModal,
  editMonthsToSupply,
  recordKeyExtractor,
  getItemLayout,
  editRequisitionItemRequiredQuantity,
} from './dataTableUtilities';

import { usePageReducer } from '../hooks';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import { buttonStrings, modalStrings, programStrings } from '../localization';

const stateInitialiser = requisition => {
  const { program, items: backingData } = requisition;
  const showAll = !!program;

  return {
    pageObject: requisition,
    backingData,
    data: showAll
      ? backingData.filter(item => item.isLessThanThresholdMOS)
      : backingData.sorted('item.name').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    showAll,
    modalValue: null,
  };
};

/**
 * Renders a mSupply mobile page with a supplier requisition loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isDisabled },
 *
 * @prop {Object} requisition The realm transaction object for this invoice.
 * @prop {Func}   runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const SupplierRequisitionPage = ({ requisition, runWithLoadingIndicator, routeName }) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(
    routeName,
    {},
    stateInitialiser,
    requisition
  );

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    pageInfo,
    pageObject,
    hasSelection,
    showAll,
    keyExtractor,
    modalValue,
    searchTerm,
  } = state;

  const { isFinalised, comment, theirRef, program } = pageObject;

  const renderPageInfo = useCallback(
    () => <PageInfo columns={pageInfo(pageObject, dispatch)} isEditingDisabled={isFinalised} />,
    [comment, theirRef, isFinalised]
  );

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'requiredQuantity':
        return editRequisitionItemRequiredQuantity;
      case 'remove':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      default:
        return null;
    }
  });

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return value => dispatch(addRequisitionItem(value));
      case MODAL_KEYS.SELECT_MONTH:
        return value => dispatch(editMonthsToSupply(value, 'Requisition'));
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return value => dispatch(editComment(value, 'Requisition'));
      default:
        return null;
    }
  };

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
          isFinalised={isFinalised}
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const AddMasterListItemsButton = useCallback(
    () => (
      <PageButton
        style={globalStyles.leftButton}
        text={buttonStrings.add_master_list_items}
        onPress={() => runWithLoadingIndicator(() => dispatch(addMasterListItems('Requisition')))}
        isDisabled={isFinalised}
      />
    ),
    []
  );

  const AddNewItemButton = useCallback(
    () => (
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.new_item}
        onPress={() => dispatch(openModal(MODAL_KEYS.SELECT_ITEM))}
        isDisabled={isFinalised}
      />
    ),
    []
  );

  const CreateAutomaticOrderButton = useCallback(
    () => (
      <PageButton
        style={{ ...globalStyles.leftButton, marginLeft: 5 }}
        text={buttonStrings.create_automatic_order}
        onPress={() => runWithLoadingIndicator(() => dispatch(createAutomaticOrder()))}
        isDisabled={isFinalised}
      />
    ),
    []
  );

  const UseSuggestedQuantitiesButton = useCallback(
    () => (
      <View>
        <PageButton
          style={globalStyles.topButton}
          text={buttonStrings.use_suggested_quantities}
          onPress={() => runWithLoadingIndicator(() => dispatch(setRequestedToSuggested()))}
          isDisabled={isFinalised}
        />
      </View>
    ),
    []
  );

  const ThresholdMOSToggle = useCallback(() => {
    const toggleProps = [
      {
        text: programStrings.hide_over_stocked,
        isOn: !showAll,
        onPress: () => dispatch(hideOverStocked()),
      },
      {
        text: programStrings.show_over_stocked,
        isOn: showAll,
        onPress: () => runWithLoadingIndicator(() => dispatch(showOverStocked())),
      },
    ];
    return <ToggleBar style={globalStyles.toggleBar} toggles={toggleProps} />;
  }, [showAll]);

  const ViewRegimenDataButton = useCallback(
    () => (
      <View>
        <PageButton
          style={{ ...globalStyles.topButton }}
          text={buttonStrings.view_regimen_data}
          onPress={() => dispatch(openModal(MODAL_KEYS.VIEW_REGIMEN_DATA))}
        />
      </View>
    ),
    []
  );

  const GeneralButtons = useCallback(() => {
    const { verticalContainer } = globalStyles;

    return (
      <>
        <View style={verticalContainer}>
          <UseSuggestedQuantitiesButton />
          <CreateAutomaticOrderButton />
        </View>
        <View style={globalStyles.verticalContainer}>
          <AddNewItemButton />
          <AddMasterListItemsButton />
        </View>
      </>
    );
  }, []);

  const ProgramButtons = useCallback(() => {
    const { verticalContainer, horizontalContainer } = globalStyles;
    return (
      <>
        <View style={verticalContainer}>
          <View style={horizontalContainer}>
            <UseSuggestedQuantitiesButton />
            <ViewRegimenDataButton />
          </View>
          <View style={verticalContainer}>
            <ThresholdMOSToggle />
          </View>
        </View>
      </>
    );
  }, [showAll]);

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
          {renderPageInfo()}
          <SearchBar
            onChangeText={value => filterData(value)}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
            value={searchTerm}
          />
        </View>
        <View style={newPageTopRightSectionContainer}>
          {program ? <ProgramButtons /> : <GeneralButtons />}
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
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteRequisitionItems())}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

SupplierRequisitionPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};
