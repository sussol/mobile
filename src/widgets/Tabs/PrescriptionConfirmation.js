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
import { FlexRow } from '../FlexRow';

import { UIDatabase } from '../../database/index';
import { pay } from '../../utilities/modules/dispensary/pay';
import { FinaliseActions } from '../../actions/FinaliseActions';
import { PaymentSummary } from '../PaymentSummary';

const mapStateToProps = state => {
  const { prescription, patient, prescriber, user, payment } = state;
  const { cashAmount } = payment;

  return { ...prescription, ...patient, ...prescriber, ...user, cashAmount };
};

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());
  return { openFinaliseModal };
};

const PrescriptionConfirmationComponent = ({
  transaction,
  currentUser,
  currentPatient,
  paymentAmount,
}) => {
  const confirmPrescription = React.useCallback(
    () => UIDatabase.write(() => pay(currentUser, currentPatient, transaction, paymentAmount)),
    []
  );
  return (
    <FlexView flex={1}>
      <PrescriptionInfo />
      <FlexRow flex={1}>
        <PrescriptionSummary transaction={transaction} />
        <PaymentSummary />
      </FlexRow>
      <PageButton style={{ alignSelf: 'flex-end' }} text="Complete" onPress={confirmPrescription} />
    </FlexView>
  );
};

PrescriptionConfirmationComponent.propTypes = {
  transaction: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  currentPatient: PropTypes.object.isRequired,
  paymentAmount: PropTypes.object.isRequired,
};

export const PrescriptionConfirmation = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionConfirmationComponent);
