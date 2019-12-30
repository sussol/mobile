/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PrescriptionSummary } from '../PrescriptionSummary';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { FlexView } from '../FlexView';
import { PageButton } from '../PageButton';

import { FinaliseActions } from '../../actions/FinaliseActions';

const mapStateToProps = state => {
  const { prescription, patient, prescriber } = state;
  return { ...prescription, ...patient, ...prescriber };
};

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());
  return { openFinaliseModal };
};

const PrescriptionConfirmationComponent = ({ transaction, openFinaliseModal }) => (
  <FlexView flex={1}>
    <PrescriptionInfo />
    <PrescriptionSummary transaction={transaction} />
    <PageButton style={{ alignSelf: 'flex-end' }} text="Complete" onPress={openFinaliseModal} />
  </FlexView>
);

PrescriptionConfirmationComponent.propTypes = {
  transaction: PropTypes.object.isRequired,
  openFinaliseModal: PropTypes.func.isRequired,
};

export const PrescriptionConfirmation = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionConfirmationComponent);
