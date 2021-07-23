/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';

import { ToastAndroid, View } from 'react-native';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';

import globalStyles from '../../globalStyles/index';
import { buttonStrings, dispensingStrings, vaccineStrings } from '../../localization/index';
import { JSONForm } from '../JSONForm/JSONForm';
import { selectSupplementalDataSchemas } from '../../selectors/formSchema';

import { PageButton } from '../PageButton';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { VaccinePrescriptionActions } from '../../actions/Entities/index';
import { WizardActions } from '../../actions/WizardActions';
import { Paper } from '../Paper';
import {
  selectSelectedSupplementalData,
  selectSupplementalDataIsValid,
} from '../../selectors/Entities/vaccinePrescription';
import { AfterInteractions } from '../AfterInteractions';

const { pageTopViewContainer } = globalStyles;

const VaccineSupplementalDataComponent = ({
  formData,
  isValid,
  onCancel,
  onComplete,
  onFormUpdate,
  siteSchema,
}) => (
  <FlexView style={pageTopViewContainer}>
    <Paper
      headerText={vaccineStrings.vaccine_dispense_supplemental_data_title}
      contentContainerStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <AfterInteractions placeholder={null}>
        <Animatable.View animation="fadeIn" duration={1000} useNativeDriver style={{ flex: 1 }}>
          <JSONForm
            formData={formData}
            surveySchema={siteSchema}
            onChange={(changed, validator) => {
              onFormUpdate(changed.formData, validator);
            }}
            liveValidate={true}
          >
            <View />
          </JSONForm>
        </Animatable.View>
      </AfterInteractions>
    </Paper>
    <FlexRow flex={0} justifyContent="flex-end" alignItems="flex-end">
      <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancel} />
      <PageButton
        text={buttonStrings.next}
        onPress={() => onComplete(isValid)}
        style={{ marginLeft: 'auto' }}
      />
    </FlexRow>
  </FlexView>
);

VaccineSupplementalDataComponent.propTypes = {
  formData: PropTypes.object,
  isValid: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onFormUpdate: PropTypes.func.isRequired,
  siteSchema: PropTypes.object,
};

const mapDispatchToProps = dispatch => {
  const onCancel = () => dispatch(VaccinePrescriptionActions.cancel());

  const onFormUpdate = (data, validator) => {
    dispatch(VaccinePrescriptionActions.updateSupplementalData(data, validator));
  };

  const onComplete = isValid => {
    if (isValid) {
      dispatch(WizardActions.nextTab());
    } else {
      ToastAndroid.show(dispensingStrings.validation_failed, ToastAndroid.LONG);
    }
  };

  return { onCancel, onComplete, onFormUpdate };
};

const mapStateToProps = state => {
  const siteSchemas = selectSupplementalDataSchemas();
  const [siteSchema] = siteSchemas;

  const formData = selectSelectedSupplementalData(state);
  const isValid = selectSupplementalDataIsValid(state);

  return { siteSchema, formData, isValid };
};

VaccineSupplementalDataComponent.propTypes = {};

export const VaccineSupplementalData = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccineSupplementalDataComponent);
