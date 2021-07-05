/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useState } from 'react';

import { View } from 'react-native';

import { batch, connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';

import globalStyles from '../../globalStyles/index';
import { buttonStrings, vaccineStrings } from '../../localization/index';
import { JSONForm } from '../JSONForm/JSONForm';
import { selectSupplementalDataSchemas } from '../../selectors/formSchema';

import { PageButton } from '../PageButton';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { VaccinePrescriptionActions } from '../../actions/Entities/index';
import { WizardActions } from '../../actions/WizardActions';
import { Paper } from '../Paper';

const { pageTopViewContainer } = globalStyles;

const VaccineSupplementalDataComponent = ({ onCancel, onComplete, siteSchema }) => {
  const [{ formData, isValid }, setForm] = useState({ formData: null, isValid: false });
  return (
    <FlexView style={pageTopViewContainer}>
      <Paper
        headerText={vaccineStrings.vaccine_dispense_supplemental_data_title}
        contentContainerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
      >
        <JSONForm
          onChange={(changed, validator) => {
            setForm({ formData: changed.formData, isValid: validator(changed.formData) });
          }}
          surveySchema={siteSchema}
        >
          <View />
        </JSONForm>
      </Paper>
      <FlexRow flex={0} justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancel} />
        <PageButton
          isDisabled={!isValid}
          text={buttonStrings.next}
          onPress={() => onComplete(formData)}
          style={{ marginLeft: 'auto' }}
        />
      </FlexRow>
    </FlexView>
  );
};

VaccineSupplementalDataComponent.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  siteSchema: PropTypes.object,
};

const mapDispatchToProps = dispatch => {
  const onCancel = () => dispatch(VaccinePrescriptionActions.cancel());

  const onComplete = siteData => {
    batch(() => {
      dispatch(VaccinePrescriptionActions.selectSupplementalData(siteData));
      dispatch(WizardActions.nextTab());
    });
  };

  return { onCancel, onComplete };
};

const mapStateToProps = () => {
  const siteSchemas = selectSupplementalDataSchemas();
  const [siteSchema] = siteSchemas;

  return { siteSchema };
};

VaccineSupplementalDataComponent.propTypes = {};

export const VaccineSupplementalData = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccineSupplementalDataComponent);
