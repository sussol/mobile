/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { MODAL_KEYS, getAllPrograms } from '../utilities';
import { buttonStrings, modalStrings } from '../localization';
import { UIDatabase } from '../database';
import Settings from '../settings/MobileAppSettings';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { getItemLayout, recordKeyExtractor } from './dataTableUtilities/utilities';
import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import { usePageReducer } from '../hooks/usePageReducer';

import {
  gotoStocktakeManagePage,
  createStocktake,
  gotoStocktakeEditPage,
} from '../navigation/actions';

export const StocktakesPage = ({ routeName, currentUser, dispatch: reduxDispatch }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    backingData: UIDatabase.objects('Stocktake'),
    data: UIDatabase.objects('Stocktake')
      .sorted('createdDate', false)
      .slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name'],
    sortBy: 'createdDate',
    isAscending: false,
    modalKey: '',
    hasSelection: false,
    currentUser,
    reduxDispatch,
    usingPrograms: getAllPrograms(Settings, UIDatabase).length > 0,
  });

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    modalKey,
    hasSelection,
    usingPrograms,
    keyExtractor,
    columns,
    PageActions,
  } = state;

  const { PROGRAM_STOCKTAKE } = MODAL_KEYS;

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
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
          dispatch={dispatch}
          getAction={getAction}
          onPress={() => reduxDispatch(gotoStocktakeEditPage(item))}
        />
      );
    },
    [data, dataState]
  );

  const newStocktake = () => {
    if (usingPrograms) return dispatch(PageActions.openModal(PROGRAM_STOCKTAKE));
    return reduxDispatch(gotoStocktakeManagePage({ stocktakeName: '' }));
  };

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_stocktake}
          onPress={() => newStocktake()}
        />
      </View>
    );
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case PROGRAM_STOCKTAKE:
        return ({ stocktakeName, program }) => {
          reduxDispatch(createStocktake({ program, stocktakeName, currentUser }));
          dispatch(PageActions.closeModal());
        };
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={PageActions.sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

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
            onChange={value => debouncedDispatch(PageActions.filterData(value))}
            style={searchBar}
            color={SUSSOL_ORANGE}
            placeholder=""
          />
        </View>
        <View style={newPageTopRightSectionContainer}>{renderButtons()}</View>
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
        onCancel={() => dispatch(PageActions.deselectAll())}
        onConfirm={() => dispatch(PageActions.deleteStocktakes())}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(PageActions.closeModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

StocktakesPage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};
