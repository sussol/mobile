/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { MODAL_KEYS } from '../utilities';
import { buttonStrings, modalStrings, programStrings } from '../localization';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, ToggleBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import {
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  openBasicModal,
  closeBasicModal,
  editComment,
  focusNext,
  focusCell,
  sortData,
  refreshData,
  addMasterListItems,
  addItem,
  createAutomaticOrder,
  useSuggestedQuantities,
  hideOverStocked,
  showOverStocked,
  editMonthsOfSupply,
  deleteItemsById,
} from './dataTableUtilities/actions';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

const keyExtractor = item => item.id;

/**
 * Renders a mSupply mobile page with customer invoice loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused, isDisabled },
 *
 * @prop {Object} transaction The realm transaction object for this invoice.
 * @prop {Func} runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const SupplierRequisitionPage = ({ requisition, runWithLoadingIndicator, routeName }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    pageObject: requisition,
    backingData: requisition.items,
    data: requisition.items.sorted('item.name').slice(),
    keyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    showAllStock: !(routeName === 'programSupplierRequisition'),
  });

  const { ITEM_SELECT, REQUISITION_COMMENT_EDIT, MONTHS_SELECT } = MODAL_KEYS;
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
    backingData,
    showAllStock,
  } = state;
  const { isFinalised, comment, theirRef, program } = pageObject;

  useEffect(() => {
    if (!showAllStock) dispatch(hideOverStocked());
  }, []);

  // Transaction is impure - finalization logic prunes items, deleting them from the transaction.
  // Since this does not manipulate the state through the reducer, state is not updated (in
  // particular `data`) so a manual syncing of `backingData` and `data` needs to occur.
  if (isFinalised && data.length !== backingData.length) dispatch(refreshData());

  const renderPageInfo = useCallback(
    () => <PageInfo columns={pageInfo(pageObject, dispatch)} isEditingDisabled={isFinalised} />,
    [comment, theirRef, isFinalised]
  );

  const getItemLayout = useCallback((item, index) => {
    const { height } = newDataTableStyles.row;
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'totalQuantity':
        return null;
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
          isFinalised={isFinalised}
          dispatch={dispatch}
          focusCellAction={focusCell}
          focusNextAction={focusNext}
          getAction={getAction}
        />
      );
    },
    [data, dataState]
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
        onPress={() => dispatch(openBasicModal(ITEM_SELECT))}
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
        onPress={() => runWithLoadingIndicator(() => dispatch(createAutomaticOrder('Requisition')))}
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
          onPress={() =>
            runWithLoadingIndicator(() => dispatch(useSuggestedQuantities('Requisition')))
          }
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
        isOn: !showAllStock,
        onPress: () => dispatch(hideOverStocked()),
      },
      {
        text: programStrings.show_over_stocked,
        isOn: showAllStock,
        onPress: () => runWithLoadingIndicator(() => dispatch(showOverStocked())),
      },
    ];
    return <ToggleBar style={globalStyles.toggleBar} toggles={toggleProps} />;
  }, [showAllStock]);

  const ViewRegimenDataButton = useCallback(
    () => (
      <View>
        <PageButton
          style={{ ...globalStyles.topButton }}
          text={buttonStrings.view_regimen_data}
          onPress={() => null}
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
  }, [showAllStock]);

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const getModalOnSelect = () => {
    switch (modalKey) {
      case ITEM_SELECT:
        return value => dispatch(addItem(value, 'RequisitionItem'));
      case MONTHS_SELECT:
        return value => dispatch(editMonthsOfSupply(value, 'Requisition'));
      case REQUISITION_COMMENT_EDIT:
        return value => dispatch(editComment(value, 'Requisition'));
      default:
        return null;
    }
  };

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
            onChange={value => debouncedDispatch(filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
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
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteItemsById('Requisition'))}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeBasicModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={pageObject[modalKey]}
      />
    </DataTablePageView>
  );
};

SupplierRequisitionPage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};

console.disableYellowBox = true;
