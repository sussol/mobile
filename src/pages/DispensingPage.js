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
import { SearchForm } from '../widgets/modals/SearchForm';
import { PatientHistoryModal } from '../widgets/modals/PatientHistory';
import { FormControl } from '../widgets/FormControl';
import { ModalContainer } from '../widgets/modals/ModalContainer';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';
import { createPrescription } from '../navigation/actions';
import { useNavigationFocus, useSyncListener, useDebounce } from '../hooks';

import { UIDatabase } from '../database';
import { getFormInputConfig } from '../utilities/formInputConfigs';

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';
import { InsuranceActions } from '../actions/InsuranceActions';
import { DispensaryActions } from '../actions/DispensaryActions';

import {
  selectDataSetInUse,
  selectSortedData,
  selectLookupModalOpen,
} from '../selectors/dispensary';
import { selectPrescriberModalOpen, selectCanEditPrescriber } from '../selectors/prescriber';
import { selectInsuranceModalOpen, selectCanEditInsurancePolicy } from '../selectors/insurance';
import { selectPatientModalOpen, selectCanEditPatient } from '../selectors/patient';

import globalStyles from '../globalStyles';
import { dispensingStrings } from '../localization';

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
  navigation,
  refreshData,
  switchDataset,

  // Dispensary lookup API callbacks
  lookupRecord,
  cancelLookupRecord,

  // Dispensary lookup API variables
  isLookupModalOpen,

  // Patient variable
  patientEditModalOpen,
  currentPatient,
  patientHistoryModalOpen,
  canEditPatient,

  // Patient callback
  editPatient,
  createPatient,
  cancelPatientEdit,
  savePatient,
  viewPatientHistory,

  // Prescriber variables
  currentPrescriber,
  prescriberModalOpen,
  canEditPrescriber,

  // Prescriber callbacks
  editPrescriber,
  createPrescriber,
  cancelPrescriberEdit,
  savePrescriber,

  // Insurance variables
  insuranceModalOpen,
  selectedInsurancePolicy,
  canEditInsurancePolicy,
  isCreatingInsurancePolicy,

  // Insurance callbacks
  cancelInsuranceEdit,
  saveInsurancePolicy,
}) => {
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(navigation, refreshData);
  useSyncListener(refreshData, 'Name');
  const togglePatientAndPrescriber = useDebounce(switchDataset, 250, true);

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
        text: dispensingStrings.patients,
        onPress: togglePatientAndPrescriber,
        isOn: usingPatientsDataSet,
      },
      {
        text: dispensingStrings.prescribers,
        onPress: togglePatientAndPrescriber,
        isOn: usingPrescribersDataSet,
      },
    ],
    [usingPatientsDataSet, usingPrescribersDataSet, togglePatientAndPrescriber]
  );

  const newRecordText = useMemo(
    () =>
      usingPatientsDataSet
        ? `${dispensingStrings.new_patient}`
        : `${dispensingStrings.new} ${dispensingStrings.prescriber}`,
    [usingPatientsDataSet]
  );
  const lookupRecordText = useMemo(
    () =>
      usingPatientsDataSet
        ? `${dispensingStrings.lookup_patient}`
        : `${dispensingStrings.lookup_prescriber}`,
    [usingPatientsDataSet]
  );

  const newRecordAction = useMemo(() => (usingPatientsDataSet ? createPatient : createPrescriber), [
    usingPatientsDataSet,
  ]);
  const lookupRecordAction = useMemo(() => lookupRecord, []);

  const { pageTopSectionContainer } = globalStyles;
  return (
    <>
      <DataTablePageView>
        <View style={pageTopSectionContainer}>
          <ToggleBar toggles={toggles} />
          <SearchBar
            onChangeText={filter}
            value={searchTerm}
            viewStyle={localStyles.searchBar}
            placeholder={dispensingStrings.search_by_last_name_first_name}
          />
          <PageButton text={newRecordText} onPress={newRecordAction} style={localStyles.button} />
          <PageButton
            text={lookupRecordText}
            onPress={lookupRecordAction}
            style={localStyles.button}
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
      <ModalContainer
        title={`${dispensingStrings.patient_detail}`}
        noCancel
        isVisible={patientEditModalOpen}
      >
        <FormControl
          isDisabled={!canEditPatient}
          onSave={savePatient}
          onCancel={cancelPatientEdit}
          inputConfig={getFormInputConfig('patient', currentPatient)}
        />
      </ModalContainer>
      <ModalContainer
        title={`${dispensingStrings.prescriber} ${dispensingStrings.details}`}
        noCancel
        isVisible={prescriberModalOpen}
      >
        <FormControl
          isDisabled={!canEditPrescriber}
          onSave={savePrescriber}
          onCancel={cancelPrescriberEdit}
          inputConfig={getFormInputConfig('prescriber', currentPrescriber)}
        />
      </ModalContainer>
      <ModalContainer
        title={`${dispensingStrings.insurance_policy}`}
        noCancel
        isVisible={insuranceModalOpen}
      >
        <FormControl
          isDisabled={!canEditInsurancePolicy}
          confirmOnSave={!canEditPatient}
          confirmText={dispensingStrings.confirm_new_policy}
          onSave={saveInsurancePolicy}
          onCancel={cancelInsuranceEdit}
          inputConfig={getFormInputConfig(
            'insurancePolicy',
            isCreatingInsurancePolicy ? null : selectedInsurancePolicy
          )}
        />
      </ModalContainer>
      <ModalContainer
        title={`${dispensingStrings.patient} ${dispensingStrings.history} - ${currentPatient?.name}`}
        onClose={cancelPatientEdit}
        isVisible={patientHistoryModalOpen}
      >
        <PatientHistoryModal />
      </ModalContainer>
      <ModalContainer
        title={
          usingPatientsDataSet
            ? `${dispensingStrings.lookup_patient}`
            : `${dispensingStrings.lookup_prescriber}`
        }
        onClose={cancelLookupRecord}
        isVisible={isLookupModalOpen}
      >
        <SearchForm />
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
  button: {
    marginHorizontal: 2.5,
  },
};

const mapStateToProps = state => {
  const { patient, prescriber, insurance, dispensary } = state;
  const { sortKey, isAscending, searchTerm, columns } = dispensary;

  const isLookupModalOpen = selectLookupModalOpen(state);

  const { currentPatient } = patient;
  const { currentPrescriber } = prescriber;
  const { isCreatingInsurancePolicy, selectedInsurancePolicy } = insurance;

  const prescriberModalOpen = selectPrescriberModalOpen(state);
  const canEditPrescriber = selectCanEditPrescriber(state);
  const canEditPatient = selectCanEditPatient(state);
  const canEditInsurancePolicy = selectCanEditInsurancePolicy(state);
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
    // Dispensary lookup API
    isLookupModalOpen,
    // Patient
    patientEditModalOpen,
    currentPatient,
    patientHistoryModalOpen,
    canEditPatient,
    // Prescriber
    currentPrescriber,
    prescriberModalOpen,
    canEditPrescriber,
    // Insurance
    insuranceModalOpen,
    selectedInsurancePolicy,
    canEditInsurancePolicy,
    isCreatingInsurancePolicy,
  };
};

const mapDispatchToProps = dispatch => ({
  gotoPrescription: patientID => dispatch(createPrescription(patientID)),

  filter: searchTerm => dispatch(DispensaryActions.filter(searchTerm)),
  sort: sortKey => dispatch(DispensaryActions.sort(sortKey)),
  refreshData: () => dispatch(DispensaryActions.refresh()),
  switchDataset: () => dispatch(DispensaryActions.switchDataSet()),

  lookupRecord: () => dispatch(DispensaryActions.openLookupModal()),
  cancelLookupRecord: () => dispatch(DispensaryActions.closeLookupModal()),

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
  canEditPrescriber: false,
};

Dispensing.propTypes = {
  data: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  isAscending: PropTypes.bool.isRequired,
  sortKey: PropTypes.string.isRequired,
  sort: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  filter: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
  switchDataset: PropTypes.func.isRequired,
  lookupRecord: PropTypes.func.isRequired,
  cancelLookupRecord: PropTypes.func.isRequired,
  isLookupModalOpen: PropTypes.bool.isRequired,
  gotoPrescription: PropTypes.func.isRequired,
  editPatient: PropTypes.func.isRequired,
  patientEditModalOpen: PropTypes.bool.isRequired,
  createPatient: PropTypes.func.isRequired,
  savePatient: PropTypes.func.isRequired,
  cancelPatientEdit: PropTypes.func.isRequired,
  currentPatient: PropTypes.object,
  canEditPatient: PropTypes.bool.isRequired,
  currentPrescriber: PropTypes.object,
  canEditPrescriber: PropTypes.bool,
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
  canEditInsurancePolicy: PropTypes.bool.isRequired,
  cancelInsuranceEdit: PropTypes.func.isRequired,
  isCreatingInsurancePolicy: PropTypes.bool.isRequired,
  saveInsurancePolicy: PropTypes.func.isRequired,
  viewPatientHistory: PropTypes.func.isRequired,
};
