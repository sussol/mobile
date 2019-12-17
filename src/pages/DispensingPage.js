/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View } from 'react-native';

import { ToggleBar, DataTablePageView, SearchBar, PageButton } from '../widgets';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../widgets/DataTable';

import globalStyles from '../globalStyles';
import { PageActions, DATA_SET, getItemLayout, getPageDispatchers } from './dataTableUtilities';
import { createPrescription } from '../navigation/actions';
import { ROUTES } from '../navigation/constants';
import ModalContainer from '../widgets/modals/ModalContainer';
import { PatientEdit } from '../widgets/modals/PatientEdit';
import { PatientActions } from '../actions/PatientActions';

const Dispensing = ({
  data,
  keyExtractor,
  columns,
  isAscending,
  sortKey,
  dispatch,
  dataSet,
  onSortColumn,
  searchTerm,
  onFilterData,
  gotoPrescription,
  editPatient,
  modalOpen,
  createPatient,
}) => {
  const getCellCallbacks = colKey => {
    switch (colKey) {
      case 'dispense':
        return gotoPrescription;
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
          getCallback={getCellCallbacks}
          columns={columns}
          rowIndex={index}
          onPress={editPatient}
        />
      );
    },
    [data]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        isAscending={isAscending}
        sortKey={sortKey}
        onPress={onSortColumn}
      />
    ),
    [sortKey, isAscending, columns]
  );

  const toggles = useMemo(
    () => [
      {
        text: 'Patients',
        onPress: () => dispatch(PageActions.toggleDataSet(DATA_SET.PATIENTS, ROUTES.DISPENSARY)),
        isOn: dataSet === DATA_SET.PATIENTS,
      },
      {
        text: 'Prescribers',
        onPress: () => dispatch(PageActions.toggleDataSet(DATA_SET.PRESCRIBERS, ROUTES.DISPENSARY)),
        isOn: dataSet === DATA_SET.PRESCRIBERS,
      },
    ],
    [dataSet]
  );

  const { pageTopSectionContainer } = globalStyles;
  return (
    <>
      <DataTablePageView>
        <View style={pageTopSectionContainer}>
          <ToggleBar toggles={toggles} />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            viewStyle={localStyles.searchBar}
          />
          <PageButton text="New Patient" onPress={createPatient} />
        </View>
        <DataTable
          data={data}
          renderRow={renderRow}
          renderHeader={renderHeader}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
        />
      </DataTablePageView>
      <ModalContainer title="Patient Details" fullScreen isVisible={modalOpen}>
        <PatientEdit />
      </ModalContainer>
    </>
  );
};

const localStyles = {
  searchBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
    flexGrow: 1,
  },
};

const mapStateToProps = state => {
  const { pages, patient } = state;

  const { dispensary } = pages;
  const { isCreating, isEditing } = patient;

  return { ...dispensary, modalOpen: isCreating || isEditing };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const gotoPrescription = patientID => dispatch(createPrescription(patientID));

  const editPatient = patientID => dispatch(PatientActions.editPatient(patientID));
  const createPatient = () => dispatch(PatientActions.createPatient());

  return {
    ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.DISPENSARY),
    gotoPrescription,
    editPatient,
    createPatient,
  };
};

export const DispensingPage = connect(mapStateToProps, mapDispatchToProps)(Dispensing);

Dispensing.propTypes = {
  data: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  isAscending: PropTypes.bool.isRequired,
  sortKey: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  dataSet: PropTypes.string.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onFilterData: PropTypes.func.isRequired,
  gotoPrescription: PropTypes.func.isRequired,
  editPatient: PropTypes.func.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  createPatient: PropTypes.func.isRequired,
};
