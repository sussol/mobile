/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Wizard } from '../widgets';
import { PrescriberSelect } from '../widgets/Tabs/PrescriberSelect';
import { ItemSelect } from '../widgets/Tabs/ItemSelect';
import { PrescriptionConfirmation } from '../widgets/Tabs/PrescriptionConfirmation';

import { useRecordListener } from '../hooks';
import { WizardActions } from '../actions/WizardActions';

const tabs = [PrescriberSelect, ItemSelect, PrescriptionConfirmation];
const titles = ['Select the Prescriber', 'Select items', 'Finalise'];

export const Prescription = ({ transaction, completePrescription }) => {
  useRecordListener(completePrescription, transaction, 'Transaction');
  return <Wizard tabs={tabs} titles={titles} />;
};

const mapDispatchToProps = dispatch => {
  const completePrescription = () => dispatch(WizardActions.complete());
  return { completePrescription };
};

export const PrescriptionPage = connect(null, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  transaction: PropTypes.object.isRequired,
  completePrescription: PropTypes.func.isRequired,
};
