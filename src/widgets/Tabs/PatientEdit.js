/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { batch, connect } from 'react-redux';

import { FormControl } from '../FormControl';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { VaccinePrescriptionInfo } from '../VaccinePrescriptionInfo';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

import { selectEditingName } from '../../selectors/Entities/name';
// import { NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { selectCanSaveForm, selectCompletedForm } from '../../selectors/form';
import { getFormInputConfig } from '../../utilities/formInputConfigs';

import { buttonStrings } from '../../localization';
import globalStyles, { DARK_GREY } from '../../globalStyles';
import { JSONForm } from '../JSONForm/JSONForm';

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
const PatientEditComponent = ({
  canSaveForm,
  completedForm,
  currentPatient,
  onCancelPrescription,
  updatePatientDetails,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const savePatient = () => {
    console.info('** saved **', canSaveForm, completedForm);
    updatePatientDetails();
  };

  return (
    <FlexView style={pageTopViewContainer}>
      <FlexRow style={{ marginBottom: 7 }} justifyContent="flex-end">
        <VaccinePrescriptionInfo />
      </FlexRow>

      <View style={localStyles.container}>
        <View style={localStyles.formContainer}>
          <FormControl
            showCancelButton={false}
            showSaveButton={false}
            inputConfig={getFormInputConfig('patient', currentPatient)}
          />
        </View>
        <View style={localStyles.verticalSeparator} />
        <View style={localStyles.formContainer}>
          <JSONForm />
        </View>
      </View>

      <FlexRow justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress
          text={buttonStrings.cancel}
          onPress={onCancelPrescription}
          style={{ marginRight: 7 }}
        />
        <PageButton
          isDisabled={!canSaveForm}
          text={buttonStrings.next}
          onPress={savePatient}
          style={{ marginLeft: 5 }}
        />
      </FlexRow>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const updatePatientDetails = () =>
    batch(() => {
      // dispatch(NameActions.update());
      dispatch(WizardActions.nextTab());
    });

  return { onCancelPrescription, updatePatientDetails };
};

const mapStateToProps = state => {
  const currentPatient = selectEditingName(state);
  const completedForm = selectCompletedForm(state);
  const canSaveForm = selectCanSaveForm(state);

  return { canSaveForm, completedForm, currentPatient };
};

PatientEditComponent.propTypes = {
  canSaveForm: PropTypes.bool.isRequired,
  completedForm: PropTypes.object.isRequired,
  currentPatient: PropTypes.object.isRequired,
  onCancelPrescription: PropTypes.func.isRequired,
  updatePatientDetails: PropTypes.func.isRequired,
};

export const PatientEdit = connect(mapStateToProps, mapDispatchToProps)(PatientEditComponent);
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
});