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
import { buttonStrings, modalStrings } from '../localization';
import { UIDatabase } from '../database';
import { BottomModal } from '../widgets/modals';
import { PageButton, TextInput, OnePressButton } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import {
  sortData,
  filterData,
  selectRow,
  deselectRow,
  // deselectAll,
  // closeBasicModal,
  // deleteRequisitions,
} from './dataTableUtilities/actions';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

// import {
//   gotoStocktakeManagePage,
//   createStocktake,
//   gotoStocktakeEditPage,
// } from '../navigation/actions';

const keyExtractor = item => item.id;

// eslint-disable-next-line no-unused-vars
export const StocktakeManagePage = ({ routeName, dispatch: reduxDispatch, stocktake }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    pageObject: stocktake,
    backingData: UIDatabase.objects('Item'),
    data: UIDatabase.objects('Item')
      .sorted('name')
      .slice(),
    keyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['name', 'code'],
    sortBy: 'name',
    isAscending: true,
    hasSelection: false,
  });

  const { data, dataState, sortBy, isAscending, columns, hasSelection } = state;

  const getItemLayout = useCallback((_, index) => {
    const { height } = newDataTableStyles.row;
    return {
      length: height,
      offset: height * index,
      index,
    };
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'selected':
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
          dispatch={dispatch}
          getAction={getAction}
        />
      );
    },
    [data, dataState]
  );

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton style={topButton} text={buttonStrings.new_stocktake} onPress={null} />
      </View>
    );
  };

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
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
            onChange={value => debouncedDispatch(filterData(value))}
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
      <BottomModal
        isOpen={!(stocktake && stocktake.isFinalised) && hasSelection}
        style={{
          justifyContent: 'space-between',
          paddingLeft: 20,
        }}
      >
        <TextInput
          style={globalStyles.modalTextInput}
          textStyle={globalStyles.modalText}
          underlineColorAndroid="transparent"
          placeholderTextColor="white"
          placeholder={modalStrings.give_your_stocktake_a_name}
          value="hehe"
          onChangeText={null}
        />
        <OnePressButton
          style={[globalStyles.button, globalStyles.modalOrangeButton]}
          textStyle={[globalStyles.buttonText, globalStyles.modalButtonText]}
          text={!stocktake ? modalStrings.create : modalStrings.confirm}
          onPress={null}
        />
      </BottomModal>
    </DataTablePageView>
  );
};

StocktakeManagePage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  stocktake: PropTypes.object.isRequired,
};
