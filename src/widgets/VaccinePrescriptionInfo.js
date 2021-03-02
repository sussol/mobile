/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FlexRow } from './FlexRow';
import { FlexView } from './FlexView';
import { FlexColumn } from './FlexColumn';
import { SimpleLabel } from './SimpleLabel';
import { selectFullName } from '../selectors/Entities/name';

import { dispensingStrings } from '../localization';

const VaccinePrescriptionInfoComponent = ({ patientName }) => (
  <FlexRow style={{ marginRight: 'auto' }}>
    <FlexColumn flex={1}>
      <FlexRow alignItems="flex-start">
        <FlexView flex={3}>
          <SimpleLabel label={dispensingStrings.patient} size="small" />
          <SimpleLabel text={patientName} size="medium" numberOfLines={1} />
        </FlexView>
      </FlexRow>
    </FlexColumn>
  </FlexRow>
);

const mapStateToProps = state => {
  const patientName = selectFullName(state);

  return {
    patientName,
  };
};

VaccinePrescriptionInfoComponent.defaultProps = {};

VaccinePrescriptionInfoComponent.propTypes = {
  patientName: PropTypes.string.isRequired,
};

export const VaccinePrescriptionInfo = connect(mapStateToProps)(VaccinePrescriptionInfoComponent);
