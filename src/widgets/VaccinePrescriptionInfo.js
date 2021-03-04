/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FlexRow } from './FlexRow';
import { SimpleLabel } from './SimpleLabel';
import { selectFullName } from '../selectors/Entities/name';

const VaccinePrescriptionInfoComponent = ({ patientName }) =>
  patientName ? (
    <FlexRow style={{ marginRight: 'auto', marginVertical: 10 }} flex={1}>
      <SimpleLabel text={patientName} size="medium" numberOfLines={1} />
    </FlexRow>
  ) : null;

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
