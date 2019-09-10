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
  openBasicModal,
} from './dataTableUtilities/actions';
import { getItemLayout, recordKeyExtractor } from './dataTableUtilities/utilities';
import globalStyles, { SUSSOL_ORANGE, newDataTableStyles, newPageStyles } from '../globalStyles';
import usePageReducer from '../hooks/usePageReducer';
import DataTablePageView from './containers/DataTablePageView';

import { createSupplierRequisition, gotoSupplierRequisition } from '../navigation/actions';

/**
 * Renders a mSupply mobile page with a list of supplier requisitions.
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from `backingData` to display in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused },
 *
 * @prop {Object} transaction The realm transaction object for this invoice.
 * @prop {Func} runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const SupplierRequisitionsPage = ({ routeName, currentUser, dispatch: reduxDispatch }) => {
  const [state, dispatch, instantDebouncedDispatch, debouncedDispatch] = usePageReducer(routeName, {
    backingData: UIDatabase.objects('RequestRequisition'),
    data: UIDatabase.objects('RequestRequisition')
      .sorted('serialNumber')
      .slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    searchTerm: '',
    filterDataKeys: ['serialNumber'],
    sortBy: 'serialNumber',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    currentUser,
  });

  const { data, dataState, sortBy, isAscending, columns, modalKey, hasSelection } = state;

  const usingPrograms = useCallback(getAllPrograms(Settings, UIDatabase).length > 0, []);
  const { SELECT_SUPPLIER, PROGRAM_REQUISITION } = MODAL_KEYS;
  const NEW_REQUISITON = usingPrograms ? PROGRAM_REQUISITION : SELECT_SUPPLIER;

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
      const rowKey = recordKeyExtractor(item);
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
          onPress={() => dispatch(openBasicModal(NEW_REQUISITON))}
        />
      </View>
    );
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case SELECT_SUPPLIER:
        return otherStoreName => {
          reduxDispatch(createSupplierRequisition({ otherStoreName, currentUser }));
          dispatch(closeBasicModal());
        };
      case PROGRAM_REQUISITION:
        return requisitionParameters => {
          reduxDispatch(createSupplierRequisition({ ...requisitionParameters, currentUser }));
          dispatch(closeBasicModal());
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
        keyExtractor={recordKeyExtractor}
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
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeBasicModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

SupplierRequisitionsPage.propTypes = {
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};

SupplierRequisitionsPage.propTypes = { routeName: PropTypes.string.isRequired };
