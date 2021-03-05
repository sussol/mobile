/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Keyboard, StyleSheet, View } from 'react-native';
import { batch, connect } from 'react-redux';

import { FormControl } from '../FormControl';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { VaccinePrescriptionInfo } from '../VaccinePrescriptionInfo';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

import { selectSpecificEntityState } from '../../selectors/Entities';
import { selectSortedPatients } from '../../selectors/Entities/name';
import { NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { selectPatientSearchFormConfig } from '../../selectors/Entities/vaccinePrescription';
import { getItemLayout, getColumns } from '../../pages/dataTableUtilities';

import { MODALS } from '../constants';
import { buttonStrings, dispensingStrings, generalStrings } from '../../localization';
import globalStyles, { DARK_GREY } from '../../globalStyles';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Func}   createPatient         Callback for creating a patient.
 * @prop {object} formConfig            Configuration of the search form
 * @prop {Bool}   isAscending           Indicator if the list of patient is sorted ascending.
 * @prop {Func}   onCancelPrescription  Cancels the prescription and returns to the vaccine page
 * @prop {Func}   onFilterData          Callback for filtering patients.
 * @prop {Func}   onSortData            Callback for sorting patients by column.
 * @prop {Func}   patients              Current set of patient data.
 * @prop {Func}   selectPatient         Callback for selecting a patient.
 * @prop {String} sortKey               Current key the list of patients is sorted by.
 *
 */
const PatientSelectComponent = ({
  createPatient,
  formConfig,
  isAscending,
  onCancelPrescription,
  onFilterData,
  onSortData,
  patients,
  selectPatient,
  sortKey,
}) => {
  const columns = React.useMemo(() => getColumns(MODALS.PATIENT_LOOKUP), []);
  const { pageTopViewContainer } = globalStyles;

  const renderRow = React.useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = item.id;
      return (
        <DataTableRow
          rowData={patients[index]}
          rowKey={rowKey}
          getCallback={() => selectPatient(item)}
          columns={columns}
          rowIndex={index}
          onPress={() => selectPatient(item)}
        />
      );
    },
    [patients]
  );

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        isAscending={isAscending}
        sortKey={sortKey}
        onPress={onSortData}
      />
    ),
    [columns, sortKey, isAscending]
  );

  return (
    <FlexView style={pageTopViewContainer}>
      <FlexRow style={{ marginBottom: 7 }} justifyContent="flex-end">
        <VaccinePrescriptionInfo />
      </FlexRow>

      <View style={localStyles.container}>
        <View style={localStyles.formContainer}>
          <FormControl
            inputConfig={formConfig}
            onSave={onFilterData}
            showCancelButton={false}
            saveButtonText={generalStrings.search}
          />
        </View>
        <View style={localStyles.verticalSeparator} />
        <View style={localStyles.listContainer}>
          <DataTable
            data={patients}
            columns={columns}
            renderHeader={renderHeader}
            renderRow={renderRow}
            keyExtractor={item => item.id}
            getItemLayout={getItemLayout}
          />
        </View>
      </View>

      <FlexRow justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress
          text={buttonStrings.cancel}
          onPress={onCancelPrescription}
          style={{ marginRight: 7 }}
        />
        <PageButton
          text={`${dispensingStrings.new} ${dispensingStrings.patient}`}
          onPress={createPatient}
          style={{ marginLeft: 5 }}
        />
      </FlexRow>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onSortData = sortKey => dispatch(NameActions.sort(sortKey));
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const onFilterData = searchParameters =>
    batch(() => {
      Keyboard.dismiss();
      dispatch(NameActions.filter(searchParameters));
    });
  const selectPatient = patient =>
    batch(() => {
      dispatch(NameActions.select(patient));
      dispatch(NameNoteActions.createFromExisting(patient?.id));
      dispatch(WizardActions.nextTab());
    });
  const createPatient = () =>
    batch(() => {
      dispatch(NameActions.create());
      dispatch(WizardActions.nextTab());
    });

  return { createPatient, onCancelPrescription, onSortData, onFilterData, selectPatient };
};

const mapStateToProps = state => {
  const patientState = selectSpecificEntityState(state, 'name');
  const { searchTerm, sortKey, isAscending } = patientState;

  const formConfig = selectPatientSearchFormConfig();
  const patients = selectSortedPatients(state);

  return {
    formConfig,
    searchTerm,
    sortKey,
    isAscending,
    patients,
  };
};

PatientSelectComponent.propTypes = {
  selectPatient: PropTypes.func.isRequired,
  formConfig: PropTypes.array.isRequired,
  patients: PropTypes.object.isRequired,
  onFilterData: PropTypes.func.isRequired,
  createPatient: PropTypes.func.isRequired,
  onSortData: PropTypes.func.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  onCancelPrescription: PropTypes.func.isRequired,
};

export const PatientSelect = connect(mapStateToProps, mapDispatchToProps)(PatientSelectComponent);
const localStyles = StyleSheet.create({
  container: {
    height: '75%',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  verticalSeparator: {
    width: 10,
    backgroundColor: DARK_GREY,
  },
  listContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
});
