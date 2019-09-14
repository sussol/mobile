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

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';

import { usePageReducer, useRecordListener } from '../hooks';

import globalStyles, { SUSSOL_ORANGE, newPageStyles } from '../globalStyles';
import { buttonStrings, modalStrings, programStrings } from '../localization';

const stateInitialiser = requisition => {
  const { program, items: backingData } = requisition;
  const showAll = !program;

  return {
    pageObject: requisition,
    backingData,
    data: showAll
      ? backingData.sorted('item.name').slice()
      : backingData.filter(item => item.isLessThanThresholdMOS),
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
    modalKey,
    pageObject,
    hasSelection,
    showAll,
    keyExtractor,
    modalValue,
    searchTerm,
    PageActions,
    columns,
    getPageInfoColumns,
  } = state;

  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(() => dispatch(PageActions.refreshData()), requisition, 'Requisition');

  const { isFinalised, comment, theirRef, program } = pageObject;

  // On click handlers
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onSelectItem = () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_ITEM));
  const onViewRegimenData = () => dispatch(PageActions.openModal(MODAL_KEYS.VIEW_REGIMEN_DATA));

  const onConfirmDelete = () => dispatch(PageActions.deleteRequisitionItems());
  const onCancelDelete = () => dispatch(PageActions.deselectAll());

  const onAddItem = value => dispatch(PageActions.addRequisitionItem(value));
  const onEditMonth = value => dispatch(PageActions.editMonthsToSupply(value, 'Requisition'));
  const onEditComment = value => dispatch(PageActions.editComment(value, 'Requisition'));

  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onHideOverStocked = () => dispatch(PageActions.hideOverStocked());
  const onShowOverStocked = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.showOverStocked()));
  const onSetRequestedToSuggested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setRequestedToSuggested()));
  const onCreateAutomaticOrder = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.createAutomaticOrder()));
  const onAddFromMasterList = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.addMasterListItems('Requisition')));

  const renderPageInfo = useCallback(
    () => (
      <PageInfo
        columns={getPageInfoColumns(pageObject, dispatch, PageActions)}
        isEditingDisabled={isFinalised}
      />
    ),
    [comment, theirRef, isFinalised]
  );

  const getAction = (colKey, propName) => {
    switch (colKey) {
      case 'requiredQuantity':
        return PageActions.editRequisitionItemRequiredQuantity;
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddItem;
      case MODAL_KEYS.SELECT_MONTH:
        return onEditMonth;
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return onEditComment;
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
          isFinalised={isFinalised}
          dispatch={dispatch}
          getAction={getAction}
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
        dispatch={instantDebouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const AddMasterListItemsButton = useCallback(
    () => (
      <PageButton
        style={globalStyles.leftButton}
        text={buttonStrings.add_master_list_items}
        onPress={onAddFromMasterList}
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
        onPress={onSelectItem}
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
        onPress={onCreateAutomaticOrder}
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
          onPress={onSetRequestedToSuggested}
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
        onPress: onHideOverStocked,
      },
      {
        text: programStrings.show_over_stocked,
        isOn: showAll,
        onPress: onShowOverStocked,
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
          onPress={onViewRegimenData}
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
            onChangeText={onFilterData}
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
