/* eslint-disable no-unused-vars */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ToggleBar, DataTablePageView, SearchBar, PageButton } from '../widgets';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../widgets/DataTable';

import { recordKeyExtractor, getItemLayout, getPageDispatchers } from './dataTableUtilities';

import { ROUTES } from '../navigation';
import { generalStrings, vaccineStrings } from '../localization';
import globalStyles from '../globalStyles';

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
}) => {
  const getCallback = colKey => {
    switch (colKey) {
      case 'description':
        return onEditLocationDescription;
      case 'code':
        return onEditLocationCode;
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
        <SearchBar onChangeText={onFilterData} value={searchTerm} placeholder={placeholderString} />
        <PageButton text="" />
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={recordKeyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
    </DataTablePageView>
  );
};

const mapStateToProps = state => {
  const { pages } = state;
  const { vaccinesAdmin } = pages;

  return vaccinesAdmin;
};

const mapDispatchToProps = dispatch => getPageDispatchers(dispatch, null, ROUTES.VACCINES_ADMIN);

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
};

export const VaccineAdminPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccineAdminPageComponent);
