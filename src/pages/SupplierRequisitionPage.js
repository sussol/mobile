/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS, debounce } from '../utilities';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, PageButton, PageInfo, ToggleBar, SearchBar } from '../widgets';

import { getItemLayout } from './dataTableUtilities';

import { useRecordListener } from '../hooks';

import globalStyles from '../globalStyles';
import { buttonStrings, modalStrings, programStrings } from '../localization';

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
const SupplierRequisition = ({
  runWithLoadingIndicator,
  dispatch,
  data,
  dataState,
  sortBy,
  modalValue,
  isAscending,
  modalKey,
  pageObject,
  hasSelection,
  showAll,
  keyExtractor,
  searchTerm,
  PageActions,
  columns,
  getPageInfoColumns,
}) => {
  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(() => dispatch(PageActions.refreshData()), pageObject, 'Requisition');

  const { isFinalised, comment, theirRef, program, daysToSupply } = pageObject;

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

  const onSortColumn = useCallback(
    debounce(columnKey => dispatch(PageActions.sortData(columnKey)), 250, true),
    []
  );
  const onEditRequiredQuantity = (newValue, rowKey) =>
    dispatch(PageActions.editRequisitionItemRequiredQuantity(newValue, rowKey));
  const onCheck = rowKey => dispatch(PageActions.selectRow(rowKey));
  const onUncheck = rowKey => dispatch(PageActions.deselectRow(rowKey));

  const pageInfoColumns = useMemo(() => getPageInfoColumns(pageObject, dispatch, PageActions), [
    comment,
    theirRef,
    isFinalised,
    daysToSupply,
  ]);

  const getCallback = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'requiredQuantity':
        return onEditRequiredQuantity;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  }, []);

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
          getCallback={getCallback}
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
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const AddMasterListItemsButton = () => (
    <PageButton
      style={globalStyles.leftButton}
      text={buttonStrings.add_master_list_items}
      onPress={onAddFromMasterList}
      isDisabled={isFinalised}
    />
  );

  const AddNewItemButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.new_item}
      onPress={onSelectItem}
      isDisabled={isFinalised}
    />
  );

  const CreateAutomaticOrderButton = () => (
    <PageButton
      style={{ ...globalStyles.leftButton, marginLeft: 5 }}
      text={buttonStrings.create_automatic_order}
      onPress={onCreateAutomaticOrder}
      isDisabled={isFinalised}
    />
  );

  const UseSuggestedQuantitiesButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.use_suggested_quantities}
      onPress={onSetRequestedToSuggested}
      isDisabled={isFinalised}
    />
  );

  const toggles = useMemo(
    () => [
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
    ],
    [showAll]
  );

  const ThresholdMOSToggle = () => <ToggleBar toggles={toggles} />;

  const ViewRegimenDataButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.view_regimen_data}
      onPress={onViewRegimenData}
    />
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
  }, [isFinalised]);

  const ProgramButtons = useCallback(() => {
    const { verticalContainer, horizontalContainer } = globalStyles;
    return (
      <>
        <View style={verticalContainer}>
          <View style={horizontalContainer}>
            <UseSuggestedQuantitiesButton />
            <ViewRegimenDataButton />
          </View>
          <ThresholdMOSToggle />
        </View>
      </>
    );
  }, [showAll, isFinalised]);

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
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

const mapStateToProps = (state, ownProps) => {
  const { pages } = state;
  const { routeName } = ownProps;
  const { [routeName]: thisPagesState } = pages;
  return thisPagesState;
};

export const SupplierRequisitionPage = connect(mapStateToProps)(SupplierRequisition);

SupplierRequisition.defaultProps = {
  modalValue: null,
  showAll: false,
};

SupplierRequisition.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  PageActions: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  dataState: PropTypes.object.isRequired,
  modalKey: PropTypes.string.isRequired,
  pageObject: PropTypes.object.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  showAll: PropTypes.bool,
  modalValue: PropTypes.any,
};
