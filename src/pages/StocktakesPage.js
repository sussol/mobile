/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS, getAllPrograms } from '../utilities';
import { useSyncListener, useNavigationFocus } from '../hooks';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import { PageButton, DataTablePageView, SearchBar, ToggleBar } from '../widgets';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { ROUTES } from '../navigation/constants';

import { UIDatabase } from '../database';
import Settings from '../settings/MobileAppSettings';

import { buttonStrings, modalStrings, generalStrings, tableStrings } from '../localization';
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
  sortKey,
  isAscending,
  searchTerm,
  modalKey,
  hasSelection,
  keyExtractor,
  columns,
  refreshData,
  showFinalised,
  onFilterData,
  onDeselectAll,
  onDeleteRecords,
  onCloseModal,
  toggleFinalised,
  onCheck,
  onUncheck,
  onSortColumn,
  onNewStocktake,
}) => {
  // Listen to sync & navigation changing stocktake data - refresh if there are any.
  useSyncListener(refreshData, ['Stocktake']);
  useNavigationFocus(navigation, refreshData);

  const onRowPress = useCallback(stocktake => dispatch(gotoStocktakeEditPage(stocktake)), []);

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
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.searchBar} ${tableStrings.name}`}
          />
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
        onCancel={onDeselectAll}
        onConfirm={onDeleteRecords}
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

const mapDispatchToProps = (dispatch, ownProps) => {
  const usingPrograms = getAllPrograms(Settings, UIDatabase).length > 0;
  const onNewProgramStocktake = () =>
    dispatch(PageActions.openModal(MODAL_KEYS.PROGRAM_STOCKTAKE, ROUTES.STOCKTAKES));
  const onNewStocktake = () => dispatch(gotoStocktakeManagePage(''));

  return {
    ...getPageDispatchers(dispatch, ownProps, 'Stocktake', ROUTES.STOCKTAKES),
    onNewStocktake: usingPrograms ? onNewProgramStocktake : onNewStocktake,
    refreshData: () => dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.STOCKTAKES)),
    onFilterData: value =>
      dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.STOCKTAKES)),
  };
};

const mapStateToProps = state => {
  const { pages } = state;
  const { stocktakes } = pages;
  return stocktakes;
};

export const StocktakesPage = connect(mapStateToProps, mapDispatchToProps)(Stocktakes);

Stocktakes.defaultProps = {
  showFinalised: false,
};

Stocktakes.propTypes = {
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
  onFilterData: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onDeleteRecords: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  toggleFinalised: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  onNewStocktake: PropTypes.func.isRequired,
};
