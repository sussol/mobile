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

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';

import { FormControl } from '../widgets/FormControl';
import { getFormInputConfig } from '../utilities/formInputConfigs';
import { PatientHistoryModal } from '../widgets/modals/PatientHistory';

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
  patientModalOpen,
  createPatient,
  cancelPatientEdit,
  savePatient,
  saveNewPatient,
  isCreating,
  currentPatient,
  isCreatingPrescriber,
  currentPrescriber,
  editPrescriber,
  createPrescriber,
  cancelPrescriberEdit,
  savePrescriber,
  saveNewPrescriber,
  prescriberModalOpen,
  usingPatientsDataSet,
  usingPrescribersDataSet,
  viewingHistory,
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
          onPress={usingPatientsDataSet ? editPatient : editPrescriber}
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
        isOn: usingPatientsDataSet,
      },
      {
        text: 'Prescribers',
        onPress: () => dispatch(PageActions.toggleDataSet(DATA_SET.PRESCRIBERS, ROUTES.DISPENSARY)),
        isOn: usingPrescribersDataSet,
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
          <PageButton
            text={usingPatientsDataSet ? 'New Patient' : 'New Prescriber'}
            onPress={usingPatientsDataSet ? createPatient : createPrescriber}
          />
        </View>
        <DataTable
          data={data}
          renderRow={renderRow}
          renderHeader={renderHeader}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
        />
      </DataTablePageView>
      <ModalContainer title="Patient Details" noCancel fullScreen isVisible={patientModalOpen}>
        <FormControl
          onSave={isCreating ? saveNewPatient : savePatient}
          onCancel={cancelPatientEdit}
          inputConfig={getFormInputConfig('patient', currentPatient)}
        />
      </ModalContainer>
      <ModalContainer
        title="Prescriber Details"
        noCancel
        fullScreen
        isVisible={prescriberModalOpen}
      >
        <FormControl
          onSave={isCreatingPrescriber ? saveNewPrescriber : savePrescriber}
          onCancel={cancelPrescriberEdit}
          inputConfig={getFormInputConfig('prescriber', currentPrescriber)}
        />
      </ModalContainer>
      <ModalContainer
        title={`Patient History: ${currentPatient?.firstName} ${currentPatient?.lastName}`}
        onClose={cancelPatientEdit}
        fullScreen
        isVisible={viewingHistory}
      >
        <PatientHistoryModal />
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
  const { pages, patient, prescriber } = state;
  const { dispensary } = pages;
  const { isCreating, isEditing, currentPatient, viewingHistory } = patient;
  const { isCreatingPrescriber, isEditingPrescriber, currentPrescriber } = prescriber;

  const { dataSet } = dispensary;
  const usingPatientsDataSet = dataSet === ROUTES.PATIENTS;
  const usingPrescribersDataSet = dataSet === ROUTES.PRESCRIBERS;

  return {
    ...dispensary,
    patientModalOpen: isCreating || isEditing,
    prescriberModalOpen: isCreatingPrescriber || isEditingPrescriber,
    isCreating,
    currentPatient,
    viewingHistory,
    isCreatingPrescriber,
    isEditingPrescriber,
    currentPrescriber,
    usingPatientsDataSet,
    usingPrescribersDataSet,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.DISPENSARY),
  gotoPrescription: patientID => dispatch(createPrescription(patientID)),

  editPrescriber: prescriber => dispatch(PrescriberActions.editPrescriber(prescriber)),
  editPatient: patientID => dispatch(PatientActions.editPatient(patientID)),
  createPatient: () => dispatch(PatientActions.createPatient()),
  cancelPatientEdit: () => dispatch(PatientActions.closeModal()),
  savePatient: patientDetails => dispatch(PatientActions.patientUpdate(patientDetails)),
  saveNewPatient: patientDetails => dispatch(PatientActions.saveNewPatient(patientDetails)),

  createPrescriber: () => dispatch(PrescriberActions.createPrescriber()),
  cancelPrescriberEdit: () => dispatch(PrescriberActions.closeModal()),
  savePrescriber: prescriberDetails =>
    dispatch(PrescriberActions.updatePrescriber(prescriberDetails)),
  saveNewPrescriber: prescriberDetails =>
    dispatch(PrescriberActions.saveNewPrescriber(prescriberDetails)),
});

export const DispensingPage = connect(mapStateToProps, mapDispatchToProps)(Dispensing);

Dispensing.defaultProps = {
  currentPatient: null,
  currentPrescriber: null,
};

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
  patientModalOpen: PropTypes.bool.isRequired,
  createPatient: PropTypes.func.isRequired,
  savePatient: PropTypes.func.isRequired,
  cancelPatientEdit: PropTypes.func.isRequired,
  saveNewPatient: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  currentPatient: PropTypes.object,
  isCreatingPrescriber: PropTypes.bool.isRequired,
  currentPrescriber: PropTypes.object,
  editPrescriber: PropTypes.func.isRequired,
  createPrescriber: PropTypes.func.isRequired,
  cancelPrescriberEdit: PropTypes.func.isRequired,
  savePrescriber: PropTypes.func.isRequired,
  saveNewPrescriber: PropTypes.func.isRequired,
  prescriberModalOpen: PropTypes.bool.isRequired,
  usingPatientsDataSet: PropTypes.bool.isRequired,
  usingPrescribersDataSet: PropTypes.bool.isRequired,
  viewingHistory: PropTypes.bool.isRequired,
};
