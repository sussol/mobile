/* eslint-disable no-unused-vars */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';

import { DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DATA_TABLE_DEFAULTS } from '../widgets/DataTable/constants';
import {
  DataTablePageView,
  DropDown,
  PageButton,
  PageInfo,
  SearchBar,
  ToggleBar,
} from '../widgets';
import { ROUTES } from '../navigation/constants';

import {
  selectIndicatorCodes,
  selectCurrentIndicatorCode,
  selectIndicatorTableColumns,
  selectIndicatorTableRows,
} from '../selectors/indicators';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import { useRecordListener } from '../hooks';

import globalStyles from '../globalStyles';
import { buttonStrings, generalStrings, programStrings } from '../localization';

/**
 * Renders a mSupply mobile page with a customer requisition loaded for editing
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
 */
export const CustomerRequisition = ({
  runWithLoadingIndicator,
  data,
  dispatch,
  dataState,
  sortKey,
  isAscending,
  modalKey,
  pageObject,
  usingIndicators,
  showIndicators,
  currentIndicatorCode,
  indicatorCodes,
  keyExtractor,
  modalValue,
  searchTerm,
  columns,
  getPageInfoColumns,
  refreshData,
  onEditComment,
  onFilterData,
  onCloseModal,
  onSortColumn,
  onToggleIndicators,
  onSelectIndicator,
  onEditSuppliedQuantity,
  route,
}) => {
  // Listen for changes to this pages requisition. Refreshing data on side effects i.e. finalizing.
  useRecordListener(refreshData, pageObject, 'Requisition');

  const { isFinalised, comment } = pageObject;

  const onSetSuppliedToRequested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setSuppliedToRequested(route)));
  const onSetSuppliedToSuggested = () =>
    runWithLoadingIndicator(() => dispatch(PageActions.setSuppliedToSuggested(route)));

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, route), [
    comment,
    isFinalised,
  ]);

  const getCallback = useCallback(colKey => {
    switch (colKey) {
      case 'suppliedQuantity':
        return onEditSuppliedQuantity;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
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
          rowKey={rowKey}
          columns={columns}
          isFinalised={isFinalised}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [columns, data, dataState]
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
    [columns, sortKey, isAscending]
  );

  const ItemIndicatorToggles = useMemo(
    () => [
      {
        text: programStrings.items,
        isOn: !showIndicators,
        onPress: onToggleIndicators,
      },
      {
        text: programStrings.indicators,
        isOn: showIndicators,
        onPress: onToggleIndicators,
      },
    ],
    [showIndicators]
  );

  const ItemIndicatorToggle = () => <ToggleBar toggles={ItemIndicatorToggles} />;

  const ButtonSetSuppliedToRequested = useCallback(
    () => (
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.use_requested_quantities}
        onPress={onSetSuppliedToRequested}
        isDisabled={isFinalised}
      />
    ),
    [isFinalised]
  );

  const ButtonSetSuppliedToSuggested = useCallback(
    () => (
      <PageButton
        style={globalStyles.topButton}
        text={buttonStrings.use_suggested_quantities}
        onPress={onSetSuppliedToSuggested}
        isDisabled={isFinalised}
      />
    ),
    [isFinalised]
  );

  const IndicatorDropdown = useCallback(
    () => (
      <DropDown
        values={indicatorCodes}
        selectedValue={currentIndicatorCode}
        onValueChange={onSelectIndicator}
      />
    ),
    [indicatorCodes, currentIndicatorCode]
  );

  const ButtonsSetSupplied = useCallback(() => (
    <>
      <ButtonSetSuppliedToRequested />
      <ButtonSetSuppliedToSuggested />
    </>
  ));

  const TopRightItems = useCallback(() => (
    <View style={globalStyles.horizontalContainer}>
      <ButtonsSetSupplied />
    </View>
  ));

  const TopRightToggleItems = useCallback(
    () => (
      <>
        <ItemIndicatorToggle />
        <View style={localStyles.horizontalContainerToggles}>
          <ButtonsSetSupplied />
        </View>
      </>
    ),
    [showIndicators]
  );

  const TopRightToggleIndicators = useCallback(
    () => (
      <>
        <ItemIndicatorToggle />
        <IndicatorDropdown />
      </>
    ),
    [showIndicators, indicatorCodes, currentIndicatorCode]
  );

  const TopRightButtons = useCallback(() => {
    const { verticalContainer } = globalStyles;

    // eslint-disable-next-line no-nested-ternary
    const Buttons = usingIndicators
      ? showIndicators
        ? TopRightToggleIndicators
        : TopRightToggleItems
      : TopRightItems;

    return (
      <View style={verticalContainer}>
        <Buttons />
      </View>
    );
  }, [usingIndicators, showIndicators, indicatorCodes, currentIndicatorCode]);

  const placeholderStrings = useMemo(
    () => ({
      name: showIndicators ? generalStrings.indicator_name : generalStrings.item_name,
      code: showIndicators ? generalStrings.indicator_code : generalStrings.item_code,
    }),
    [showIndicators]
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
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${placeholderStrings.name} ${generalStrings.or} ${placeholderStrings.code}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          <TopRightButtons />
        </View>
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
        windowSize={
          showIndicators
            ? DATA_TABLE_DEFAULTS.WINDOW_SIZE_SMALL
            : DATA_TABLE_DEFAULTS.WINDOW_SIZE_MEDIUM
        }
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

const mapDispatchToProps = (dispatch, ownProps) =>
  getPageDispatchers(dispatch, ownProps, 'Requisition', ROUTES.CUSTOMER_REQUISITION);

const mapStateToProps = state => {
  const { pages } = state;
  const { customerRequisition } = pages;
  const { usingIndicators, showIndicators } = customerRequisition;

  if (usingIndicators && showIndicators) {
    return {
      ...customerRequisition,
      indicatorCodes: selectIndicatorCodes(customerRequisition),
      currentIndicatorCode: selectCurrentIndicatorCode(customerRequisition),
      data: selectIndicatorTableRows(customerRequisition),
      columns: selectIndicatorTableColumns(customerRequisition),
    };
  }

  return customerRequisition;
};

export const CustomerRequisitionPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerRequisition);

const localStyles = StyleSheet.create({
  horizontalContainerToggles: {
    ...globalStyles.horizontalContainer,
    paddingTop: 7.5,
  },
});

CustomerRequisition.defaultProps = {
  modalValue: null,
  usingIndicators: false,
  showIndicators: false,
  indicatorCodes: [],
  currentIndicatorCode: '',
};

CustomerRequisition.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  dataState: PropTypes.object.isRequired,
  modalKey: PropTypes.string.isRequired,
  pageObject: PropTypes.object.isRequired,
  modalValue: PropTypes.any,
  getPageInfoColumns: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  usingIndicators: PropTypes.bool,
  showIndicators: PropTypes.bool,
  indicatorCodes: PropTypes.array,
  currentIndicatorCode: PropTypes.string,
  onEditSuppliedQuantity: PropTypes.func.isRequired,
  onToggleIndicators: PropTypes.func.isRequired,
  onSelectIndicator: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
};
