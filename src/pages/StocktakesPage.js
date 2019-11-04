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
import { useSyncListener, useNavigationFocus } from '../hooks';
import { getItemLayout } from './dataTableUtilities';

import { PageButton, DataTablePageView, SearchBar, ToggleBar } from '../widgets';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';

import {
  gotoStocktakeManagePage,
  createStocktake,
  gotoStocktakeEditPage,
} from '../navigation/actions';

export const Stocktakes = ({
  currentUser,
  dispatch,
  navigation,
  data,
  dataState,
  sortBy,
  isAscending,
  searchTerm,
  modalKey,
  hasSelection,
  usingPrograms,
  keyExtractor,
  columns,
  PageActions,
  showFinalised,
}) => {
  const refreshCallback = useCallback(() => dispatch(PageActions.refreshData()), []);
  // Listen to sync changing stocktake data - refresh if there are any.
  useSyncListener(refreshCallback, ['Stocktake']);
  // Listen to navigation focusing this page - fresh if so.
  useNavigationFocus(refreshCallback, navigation);

  const onRowPress = useCallback(stocktake => dispatch(gotoStocktakeEditPage(stocktake)), []);
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onConfirmDelete = () => dispatch(PageActions.deleteStocktakes());
  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onToggleShowFinalised = () => dispatch(PageActions.toggleShowFinalised(showFinalised));
  const onCheck = rowKey => dispatch(PageActions.selectRow(rowKey));
  const onUncheck = rowKey => dispatch(PageActions.deselectRow(rowKey));

  const onSortColumn = useCallback(
    debounce(columnKey => dispatch(PageActions.sortData(columnKey)), 250, true),
    []
  );

  const onNewStocktake = () => {
    if (usingPrograms) return dispatch(PageActions.openModal(MODAL_KEYS.PROGRAM_STOCKTAKE));
    return dispatch(gotoStocktakeManagePage(''));
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
      case MODAL_KEYS.PROGRAM_STOCKTAKE:
        return ({ stocktakeName, program }) => {
          dispatch(createStocktake({ program, stocktakeName, currentUser }));
          onCloseModal();
        };
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
          onPress={onRowPress}
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

  const toggles = useMemo(
    () => [
      { text: buttonStrings.current, onPress: onToggleShowFinalised, isOn: !showFinalised },
      { text: buttonStrings.past, onPress: onToggleShowFinalised, isOn: showFinalised },
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
          <PageButton text={buttonStrings.new_stocktake} onPress={onNewStocktake} />
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

const mapStateToProps = state => {
  const { pages } = state;
  const { stocktakes } = pages;
  return stocktakes;
};

export const StocktakesPage = connect(mapStateToProps)(Stocktakes);

Stocktakes.defaultProps = {
  showFinalised: false,
};

Stocktakes.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortBy: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  PageActions: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  showFinalised: PropTypes.bool,
  modalKey: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  usingPrograms: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
};
