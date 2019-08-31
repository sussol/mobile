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
import { BottomConfirmModal, DataTablePageModal, ByProgramModal } from '../widgets/modals';
import { PageButton } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import {
  sortData,
  filterData,
  selectRow,
  deselectRow,
  deselectAll,
  closeBasicModal,
  deleteRequisitions,
  newSupplierRequisition,
  completeCreatingNewRecord,
} from './dataTableUtilities/actions';

import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

import { createSupplierRequisition, gotoSupplierRequisition } from '../navigation/actions';

const keyExtractor = item => item.id;

export const SupplierRequisitionsPage = ({ routeName, currentUser, dispatch: reduxDispatch }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    backingData: UIDatabase.objects('RequestRequisition'),
    data: UIDatabase.objects('RequestRequisition')
      .sorted('serialNumber')
      .slice(),
    keyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortBy: 'serialNumber',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    currentUser,
    reduxDispatch,
    usingPrograms: getAllPrograms(Settings, UIDatabase).length > 0,
  });

  const { data, dataState, sortBy, isAscending, columns, modalKey, hasSelection } = state;

  const { SELECT_SUPPLIER, PROGRAM_REQUISITION } = MODAL_KEYS;

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
          dispatch={dispatch}
          getAction={getAction}
          onPress={() => reduxDispatch(gotoSupplierRequisition(item))}
        />
      );
    },
    [data, dataState]
  );

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_requisition}
          onPress={() => dispatch(newSupplierRequisition())}
        />
      </View>
    );
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case SELECT_SUPPLIER:
        return otherStoreName => {
          reduxDispatch(createSupplierRequisition({ otherStoreName, currentUser }));
          dispatch(completeCreatingNewRecord());
        };
      case PROGRAM_REQUISITION:
        return requisitionParameters => {
          reduxDispatch(createSupplierRequisition({ ...requisitionParameters, currentUser }));
          dispatch(completeCreatingNewRecord());
        };
      default:
        return null;
    }
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
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteRequisitions())}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey && modalKey !== PROGRAM_REQUISITION}
        modalKey={modalKey}
        onClose={() => dispatch(closeBasicModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
      {modalKey === PROGRAM_REQUISITION && (
        <ByProgramModal
          isOpen={modalKey === PROGRAM_REQUISITION}
          onConfirm={getModalOnSelect()}
          onCancel={() => dispatch(closeBasicModal())}
          database={UIDatabase}
          type="requisition"
          settings={Settings}
        />
      )}
    </DataTablePageView>
  );
};

SupplierRequisitionsPage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};
