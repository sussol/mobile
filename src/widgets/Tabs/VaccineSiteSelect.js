/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useState } from 'react';

import { View } from 'react-native';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';

import globalStyles from '../../globalStyles/index';
import { buttonStrings } from '../../localization/index';
import { JSONForm } from '../JSONForm/JSONForm';
import { selectSiteSchemas } from '../../selectors/formSchema';

import { PageButton } from '../PageButton';
import { WizardActions } from '../../actions/WizardActions';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { VaccinePrescriptionActions } from '../../actions/Entities/index';

const { pageTopViewContainer } = globalStyles;

const VaccineSiteSelectComponent = ({ onCancel, onCompleted, siteSchema }) => {
  // eslint-disable-next-line no-unused-vars
  const [{ formData, isValid }, setForm] = useState({ formData: null, isValid: false });

  return (
    <FlexView style={pageTopViewContainer}>
      <JSONForm
        onChange={(changed, validator) => {
          setForm({ formData: changed.formData, isValid: validator(changed.formData) });
        }}
        surveySchema={siteSchema}
      >
        <View />
      </JSONForm>
      <FlexRow flex={0} justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancel} />
        <PageButton
          text={buttonStrings.next}
          onPress={onCompleted}
          style={{ marginLeft: 'auto' }}
        />
      </FlexRow>
    </FlexView>
  );
};

VaccineSiteSelectComponent.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  siteSchema: PropTypes.object,
};

const mapDispatchToProps = dispatch => {
  const onCancel = () => dispatch(VaccinePrescriptionActions.cancel());
  const onCompleted = () => dispatch(WizardActions.nextTab());

  return { onCancel, onCompleted };
};

const mapStateToProps = () => {
  const siteSchemas = selectSiteSchemas();
  const [siteSchema] = siteSchemas;

  return { siteSchema };
};

VaccineSiteSelectComponent.propTypes = {};

export const VaccineSiteSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccineSiteSelectComponent);
