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
import { PatientHistoryModal } from '../widgets/modals/PatientHistory';
import { FormControl } from '../widgets/FormControl';
import ModalContainer from '../widgets/modals/ModalContainer';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';
import { createPrescription } from '../navigation/actions';

import { UIDatabase } from '../database';
import { getFormInputConfig } from '../utilities/formInputConfigs';

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';
import { InsuranceActions } from '../actions/InsuranceActions';
import { DispensaryActions } from '../actions/DispensaryActions';

import { selectDataSetInUse, selectSortedData } from '../selectors/dispensary';
import { selectPrescriberModalOpen } from '../selectors/prescriber';
import { selectInsuranceModalOpen } from '../selectors/insurance';
import { selectPatientModalOpen } from '../selectors/patient';

import globalStyles from '../globalStyles';

const Dispensing = ({
  data,
  columns,
  isAscending,
  sortKey,
  searchTerm,
  usingPatientsDataSet,
  usingPrescribersDataSet,
  // Misc. Callbacks
  filter,
  sort,
  gotoPrescription,
  switchDataset,

  // Patient variable
  patientEditModalOpen,
  currentPatient,
  patientHistoryModalOpen,
  // Patient callback
  editPatient,
  createPatient,
  cancelPatientEdit,
  savePatient,
  viewPatientHistory,

  // Prescriber variables
  currentPrescriber,
  prescriberModalOpen,
  // Prescriber callbacks
  editPrescriber,
  createPrescriber,
  cancelPrescriberEdit,
  savePrescriber,

  // Insurance variables
  insuranceModalOpen,
  selectedInsurancePolicy,
  isCreatingInsurancePolicy,
  // Insurance callbacks
  cancelInsuranceEdit,
  saveInsurancePolicy,
}) => {
  const getCellCallbacks = colKey => {
    switch (colKey) {
      case 'dispense':
        return gotoPrescription;
      case 'patientHistory':
        return viewPatientHistory;
      case 'patientEdit':
        return editPatient;
      case 'prescriberEdit':
        return editPrescriber;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = recordKeyExtractor(item);
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
        onPress={sort}
      />
    ),
    [sortKey, isAscending, columns]
  );

  const toggles = useMemo(
    () => [
      {
        text: 'Patients',
        onPress: switchDataset,
        isOn: usingPatientsDataSet,
      },
      {
        text: 'Prescribers',
        onPress: switchDataset,
        isOn: usingPrescribersDataSet,
      },
    ],
    [usingPatientsDataSet, usingPrescribersDataSet, switchDataset]
  );

  const { pageTopSectionContainer } = globalStyles;
  return (
    <>
      <DataTablePageView>
        <View style={pageTopSectionContainer}>
          <ToggleBar toggles={toggles} />
          <SearchBar onChangeText={filter} value={searchTerm} viewStyle={localStyles.searchBar} />
          <PageButton
            text={usingPatientsDataSet ? 'New Patient' : 'New Prescriber'}
            onPress={usingPatientsDataSet ? createPatient : createPrescriber}
          />
        </View>
        <DataTable
          data={data}
          renderRow={renderRow}
          renderHeader={renderHeader}
          keyExtractor={recordKeyExtractor}
          getItemLayout={getItemLayout}
        />
      </DataTablePageView>
      <ModalContainer title="Patient Details" noCancel fullScreen isVisible={patientEditModalOpen}>
        <FormControl
          onSave={savePatient}
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
          onSave={savePrescriber}
          onCancel={cancelPrescriberEdit}
          inputConfig={getFormInputConfig('prescriber', currentPrescriber)}
        />
      </ModalContainer>
      <ModalContainer title="Insurance Policy" noCancel fullScreen isVisible={insuranceModalOpen}>
        <FormControl
          onSave={saveInsurancePolicy}
          onCancel={cancelInsuranceEdit}
          inputConfig={getFormInputConfig(
            'insurancePolicy',
            isCreatingInsurancePolicy ? null : selectedInsurancePolicy
          )}
        />
      </ModalContainer>
      <ModalContainer
        title={`Patient History: ${currentPatient?.firstName} ${currentPatient?.lastName}`}
        onClose={cancelPatientEdit}
        fullScreen
        isVisible={patientHistoryModalOpen}
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
  const { patient, prescriber, insurance, dispensary } = state;
  const { sortKey, isAscending, searchTerm, columns } = dispensary;

  const { currentPatient } = patient;
  const { currentPrescriber } = prescriber;
  const { isCreatingInsurancePolicy, selectedInsurancePolicy } = insurance;

  const prescriberModalOpen = selectPrescriberModalOpen(state);
  const [patientEditModalOpen, patientHistoryModalOpen] = selectPatientModalOpen(state);
  const insuranceModalOpen = selectInsuranceModalOpen(state);
  const data = selectSortedData(state);

  const [usingPatientsDataSet, usingPrescribersDataSet] = selectDataSetInUse(state);

  return {
    usingPatientsDataSet,
    usingPrescribersDataSet,
    data,
    sortKey,
    isAscending,
    searchTerm,
    columns,
    // Patient
    patientEditModalOpen,
    currentPatient,
    patientHistoryModalOpen,
    // Prescriber
    currentPrescriber,
    prescriberModalOpen,
    // Insurance
    insuranceModalOpen,
    selectedInsurancePolicy,
    isCreatingInsurancePolicy,
  };
};

const mapDispatchToProps = dispatch => ({
  gotoPrescription: patientID => dispatch(createPrescription(patientID)),

  filter: searchTerm => dispatch(DispensaryActions.filter(searchTerm)),
  sort: sortKey => dispatch(DispensaryActions.sort(sortKey)),
  switchDataset: () => dispatch(DispensaryActions.switchDataSet()),

  editPatient: patient => dispatch(PatientActions.editPatient(UIDatabase.get('Name', patient))),
  createPatient: () => dispatch(PatientActions.createPatient()),
  cancelPatientEdit: () => dispatch(PatientActions.closeModal()),
  savePatient: patientDetails => dispatch(PatientActions.patientUpdate(patientDetails)),
  viewPatientHistory: rowKey =>
    dispatch(PatientActions.viewPatientHistory(UIDatabase.get('Name', rowKey))),

  editPrescriber: prescriber =>
    dispatch(PrescriberActions.editPrescriber(UIDatabase.get('Prescriber', prescriber))),
  createPrescriber: () => dispatch(PrescriberActions.createPrescriber()),
  cancelPrescriberEdit: () => dispatch(PrescriberActions.closeModal()),
  savePrescriber: prescriberDetails =>
    dispatch(PrescriberActions.updatePrescriber(prescriberDetails)),

  cancelInsuranceEdit: () => dispatch(InsuranceActions.cancel()),
  saveInsurancePolicy: policyDetails => dispatch(InsuranceActions.update(policyDetails)),
});

export const DispensingPage = connect(mapStateToProps, mapDispatchToProps)(Dispensing);

Dispensing.defaultProps = {
  currentPatient: null,
  currentPrescriber: null,
  selectedInsurancePolicy: null,
};

Dispensing.propTypes = {
  data: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  isAscending: PropTypes.bool.isRequired,
  sortKey: PropTypes.string.isRequired,
  sort: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  filter: PropTypes.func.isRequired,
  switchDataset: PropTypes.func.isRequired,
  gotoPrescription: PropTypes.func.isRequired,
  editPatient: PropTypes.func.isRequired,
  patientEditModalOpen: PropTypes.bool.isRequired,
  createPatient: PropTypes.func.isRequired,
  savePatient: PropTypes.func.isRequired,
  cancelPatientEdit: PropTypes.func.isRequired,
  currentPatient: PropTypes.object,
  currentPrescriber: PropTypes.object,
  editPrescriber: PropTypes.func.isRequired,
  createPrescriber: PropTypes.func.isRequired,
  cancelPrescriberEdit: PropTypes.func.isRequired,
  savePrescriber: PropTypes.func.isRequired,
  prescriberModalOpen: PropTypes.bool.isRequired,
  usingPatientsDataSet: PropTypes.bool.isRequired,
  usingPrescribersDataSet: PropTypes.bool.isRequired,
  patientHistoryModalOpen: PropTypes.bool.isRequired,
  selectedInsurancePolicy: PropTypes.object,
  insuranceModalOpen: PropTypes.bool.isRequired,
  cancelInsuranceEdit: PropTypes.func.isRequired,
  isCreatingInsurancePolicy: PropTypes.bool.isRequired,
  saveInsurancePolicy: PropTypes.func.isRequired,
  viewPatientHistory: PropTypes.func.isRequired,
};
