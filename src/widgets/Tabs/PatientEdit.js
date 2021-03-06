/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useCallback, useRef } from 'react';
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
import { selectSurveySchemas } from '../../selectors/formSchema';
import { NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { selectCanSaveForm, selectCompletedForm } from '../../selectors/form';
import { getFormInputConfig } from '../../utilities/formInputConfigs';

import { buttonStrings } from '../../localization';
import globalStyles, { DARK_GREY } from '../../globalStyles';
import { JSONForm } from '../JSONForm/JSONForm';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Bool}   canSaveForm           Indicates if the patient edit form is valid and complete
 * @prop {object} completedForm         Object containing the submitted survey form
 * @prop {object} currentPatient        The current patient object - the toJSON version of [Patient]
 * @prop {object} surveySchema          Object defining the survey form
 * @prop {Func}   onCancelPrescription  Callback for cancelling
 * @prop {Func}   onSubmitSurvey        Callback for saving survey data.
 * @prop {Func}   updatePatientDetails  Callback for saving patient edit form.
 *
 */
const PatientEditComponent = ({
  canSaveForm,
  completedForm,
  currentPatient,
  surveySchema,
  onCancelPrescription,
  onSubmitSurvey,
  updatePatientDetails,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const formRef = useRef(null);
  const savePatient = useCallback(
    e => {
      updatePatientDetails(completedForm);
      formRef?.current?.submit(e);
    },
    [completedForm]
  );

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
        {surveySchema && <View style={localStyles.verticalSeparator} />}
        {surveySchema && (
          <View style={localStyles.formContainer}>
            <JSONForm ref={formRef} onSubmit={onSubmitSurvey} surveySchema={surveySchema}>
              <View />
            </JSONForm>
          </View>
        )}
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
  const onSubmitSurvey = formData => dispatch(NameNoteActions.saveNewSurvey(formData));
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const updatePatientDetails = detailsEntered =>
    batch(() => {
      dispatch(NameActions.updatePatient(detailsEntered));
      dispatch(WizardActions.nextTab());
    });

  return { onCancelPrescription, onSubmitSurvey, updatePatientDetails };
};

const mapStateToProps = state => {
  const currentPatient = selectEditingName(state);
  const completedForm = selectCompletedForm(state);
  const canSaveForm = selectCanSaveForm(state);
  const surveySchemas = selectSurveySchemas();
  const [surveySchema] = surveySchemas;

  return { canSaveForm, completedForm, currentPatient, surveySchema };
};

PatientEditComponent.defaultProps = {
  surveySchema: undefined,
};

PatientEditComponent.propTypes = {
  canSaveForm: PropTypes.bool.isRequired,
  completedForm: PropTypes.object.isRequired,
  currentPatient: PropTypes.object.isRequired,
  surveySchema: PropTypes.object,
  onCancelPrescription: PropTypes.func.isRequired,
  onSubmitSurvey: PropTypes.func.isRequired,
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
