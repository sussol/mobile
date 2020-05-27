/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { ToastAndroid, View, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ToggleBar, DataTablePageView, SearchBar, PageButton } from '../widgets';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../widgets/DataTable';
import { DataTablePageModal, ModalContainer } from '../widgets/modals';

import { recordKeyExtractor, getItemLayout, getPageDispatchers } from './dataTableUtilities';

import { TemperatureSyncActions } from '../actions/TemperatureSyncActions';
import { PageActions } from './dataTableUtilities/actions';
import { selectIsSyncingTemperatures } from '../selectors/temperatureSync';

import { UIDatabase } from '../database';
import { ROUTES } from '../navigation';
import { MODAL_KEYS } from '../utilities';

import { modalStrings, buttonStrings, generalStrings, vaccineStrings } from '../localization';
import globalStyles, { SUSSOL_ORANGE } from '../globalStyles';
import { FormControl } from '../widgets/FormControl';
import { getFormInputConfig } from '../utilities/formInputConfigs';

const VaccineAdminPageComponent = ({
  data,
  sortKey,
  isAscending,
  columns,
  dataSet,
  modalKey,
  dataState,
  searchTerm,
  onFilterData,
  onEditLocationCode,
  onEditLocationDescription,
  onSortColumn,
  onToggleFridges,
  onToggleSensors,
  onSelectLocation,
  onEditSensorName,
  onApplySensorLocation,
  onCloseModal,
  modalValue,
  dispatch,
  onCheck,
  scanForSensors,
  isScanning,
  onEditLocation,
  onSaveLocation,
}) => {
  const getCallback = colKey => {
    switch (colKey) {
      case 'edit':
        return onEditLocation;
      case 'description':
        return onEditLocationDescription;
      case 'code':
        return onEditLocationCode;
      case 'name':
        return onEditSensorName;
      case 'currentLocationName':
        return onSelectLocation;
      case 'remove':
        return onCheck;
      default:
        return null;
    }
  };

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        onPress={onSortColumn}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending, columns]
  );

  const renderRow = React.useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = recordKeyExtractor(item);

      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
  );

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_LOCATION:
        return onApplySensorLocation;

      default:
        return null;
    }
  };

  const onPress = dataSet === 'fridges' ? onEditLocation : scanForSensors;
  const buttonText = dataSet === 'fridges' ? buttonStrings.add_fridge : buttonStrings.start_scan;
  const placeholderString =
    dataSet === 'fridges'
      ? `${generalStrings.search_by} ${generalStrings.code} ${generalStrings.or} ${generalStrings.description}`
      : `${generalStrings.search_by} ${generalStrings.name}`;
  const toggles = React.useMemo(
    () => [
      { text: vaccineStrings.fridges, onPress: onToggleFridges, isOn: dataSet === 'fridges' },
      { text: vaccineStrings.sensors, onPress: onToggleSensors, isOn: dataSet === 'sensors' },
    ],
    [dataSet]
  );

  return (
    <DataTablePageView>
      <View style={globalStyles.pageTopSectionContainer}>
        <ToggleBar toggles={toggles} />
        <SearchBar
          viewStyle={localStyles.searchBar}
          onChangeText={onFilterData}
          value={searchTerm}
          placeholder={placeholderString}
        />
        {isScanning ? (
          <ActivityIndicator
            style={localStyles.indicatorContainer}
            color={SUSSOL_ORANGE}
            size="small"
          />
        ) : (
          <PageButton text={buttonText} onPress={onPress} />
        )}
      </View>

      <DataTable
        data={data}
        renderRow={renderRow}
        extraData={dataState}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />

      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey && modalKey !== MODAL_KEYS.EDIT_LOCATION}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />

      <ModalContainer
        title={modalStrings.location_details}
        noCancel
        fullScreen
        isVisible={modalKey === MODAL_KEYS.EDIT_LOCATION}
      >
        <FormControl
          isDisabled={false}
          onSave={onSaveLocation}
          onCancel={onCloseModal}
          inputConfig={getFormInputConfig('location', modalValue)}
        />
      </ModalContainer>
    </DataTablePageView>
  );
};

const localStyles = StyleSheet.create({
  // Required to override search bar styles to have it properly nest between
  // toggles and buttons.
  searchBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
    flexGrow: 1,
  },
  // Used to match the width of a PageButton
  indicatorContainer: { width: 140 },
});

const mapStateToProps = state => {
  const { pages } = state;
  const { vaccinesAdmin } = pages;
  const isScanning = selectIsSyncingTemperatures(state);

  return { ...vaccinesAdmin, isScanning };
};

const mapDispatchToProps = dispatch => {
  const scanForSensors = () => dispatch(TemperatureSyncActions.startSensorScan());
  const editLocation = rowKey =>
    dispatch(PageActions.openModal(MODAL_KEYS.EDIT_LOCATION, rowKey, ROUTES.VACCINES_ADMIN));

  const hasLocationTypes = !UIDatabase.objects('LocationType').length;
  const noLocationTypesToast = () =>
    ToastAndroid.show(generalStrings.no_location_types, ToastAndroid.LONG);
  const onEditLocation = hasLocationTypes ? editLocation : noLocationTypesToast;

  return {
    ...getPageDispatchers(dispatch, 'Location', ROUTES.VACCINES_ADMIN),
    scanForSensors,
    onEditLocation,
  };
};

VaccineAdminPageComponent.defaultProps = { modalValue: null };

VaccineAdminPageComponent.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  columns: PropTypes.array.isRequired,
  dataSet: PropTypes.string.isRequired,
  modalKey: PropTypes.string.isRequired,
  dataState: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onEditLocationCode: PropTypes.func.isRequired,
  onEditLocationDescription: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onToggleFridges: PropTypes.func.isRequired,
  onToggleSensors: PropTypes.func.isRequired,
  onSelectLocation: PropTypes.func.isRequired,
  onEditSensorName: PropTypes.func.isRequired,
  onApplySensorLocation: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  modalValue: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  scanForSensors: PropTypes.func.isRequired,
  isScanning: PropTypes.bool.isRequired,
  onEditLocation: PropTypes.func.isRequired,
  onSaveLocation: PropTypes.func.isRequired,
};

export const VaccineAdminPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccineAdminPageComponent);
