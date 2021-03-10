/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Keyboard, StyleSheet, View } from 'react-native';
import { batch, connect } from 'react-redux';
import { useDebounce } from '../../hooks/useDebounce';

import { FormControl } from '../FormControl';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

import { selectSpecificEntityState } from '../../selectors/Entities';
import { selectSortedPatients } from '../../selectors/Entities/name';
import { NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { FormActions } from '../../actions/FormActions';
import { selectPatientSearchFormConfig } from '../../selectors/Entities/vaccinePrescription';
import { getColumns } from '../../pages/dataTableUtilities';

import { MODALS } from '../constants';
import {
  buttonStrings,
  dispensingStrings,
  generalStrings,
  vaccineStrings,
} from '../../localization';
import globalStyles, { DARK_GREY } from '../../globalStyles';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { AfterInteractions } from '../AfterInteractions';
import { generateUUID } from '../../database/index';
import { SimpleTable } from '../SimpleTable';
import { useKeyboardIsOpen } from '../../hooks/useKeyboardIsOpen';
import { Paper } from '../Paper';

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
  onCancelPrescription,
  onFilterData,
  patients,
  selectPatient,
  updateForm,
}) => {
  const columns = React.useMemo(() => getColumns(MODALS.PATIENT_LOOKUP), []);
  const { pageTopViewContainer } = globalStyles;
  const keyboardIsOpen = useKeyboardIsOpen();
  const debouncedFilter = useDebounce(onFilterData, 300);
  const handleUpdate = (key, value) => {
    updateForm(key, value);
    debouncedFilter(key, value);
  };

  return (
    <FlexView style={pageTopViewContainer}>
      <Paper
        style={{ flex: 6 }}
        contentContainerStyle={{ flex: 1 }}
        headerText={vaccineStrings.vaccine_dispense_step_one_title}
      >
        <AfterInteractions placeholder={null}>
          <View style={localStyles.container}>
            <View style={localStyles.formContainer}>
              <FormControl
                inputConfig={formConfig}
                onUpdate={handleUpdate}
                showCancelButton={false}
                showSaveButton={false}
                saveButtonText={generalStrings.search}
              />
            </View>

            <View style={localStyles.listContainer}>
              <SimpleTable selectRow={selectPatient} data={patients} columns={columns} />
            </View>
          </View>
        </AfterInteractions>
      </Paper>
      {!keyboardIsOpen && (
        <FlexRow flex={0} style={{ bottom: 0 }} justifyContent="flex-end" alignItems="flex-end">
          <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancelPrescription} />
          <PageButton
            text={`${dispensingStrings.new} ${dispensingStrings.patient}`}
            onPress={createPatient}
            style={{ marginLeft: 'auto' }}
          />
        </FlexRow>
      )}
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onSortData = sortKey => dispatch(NameActions.sort(sortKey));
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const onFilterData = (key, value) => dispatch(NameActions.filter(key, value));
  const selectPatient = patient =>
    batch(() => {
      Keyboard.dismiss();
      dispatch(NameActions.select(patient));
      dispatch(NameNoteActions.createSurveyNameNote(patient?.id));
      dispatch(WizardActions.nextTab());
    });
  const createPatient = () =>
    batch(() => {
      const id = generateUUID();
      dispatch(NameActions.create(id));
      dispatch(NameNoteActions.createSurveyNameNote(id));
      dispatch(WizardActions.nextTab());
    });
  const updateForm = (key, value) => dispatch(FormActions.updateForm(key, value));

  return {
    createPatient,
    onCancelPrescription,
    onSortData,
    onFilterData,
    selectPatient,
    updateForm,
  };
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
  onCancelPrescription: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
};

export const PatientSelect = connect(mapStateToProps, mapDispatchToProps)(PatientSelectComponent);
const localStyles = StyleSheet.create({
  container: {
    flex: 12,
    height: '100%',
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
