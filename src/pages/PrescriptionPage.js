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

import {
  selectItem,
  selectPrescriber,
  switchTab,
  editQuantity,
} from '../reducers/PrescriptionReducer';

const mapDispatchToProps = dispatch => {
  const choosePrescriber = prescriberID => dispatch(selectPrescriber(prescriberID));
  const chooseItem = itemID => dispatch(selectItem(itemID));
  const nextTab = currentTab => dispatch(switchTab(currentTab + 1));
  const updateQuantity = (id, quantity) => dispatch(editQuantity(id, quantity));
  return { nextTab, choosePrescriber, chooseItem, updateQuantity };
};

const mapStateToProps = state => {
  const { prescription, patient, prescriber } = state;
  return { ...prescription, ...patient, ...prescriber };
};

const tabs = [PrescriberSelect, ItemSelect, PrescriptionConfirmation];
const titles = ['Select the Prescriber', 'Select items', 'Finalise'];

export const Prescription = ({ currentTab, nextTab }) => (
  <Wizard tabs={tabs} titles={titles} currentTabIndex={currentTab} onPress={nextTab} />
);

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  currentTab: PropTypes.number.isRequired,
  nextTab: PropTypes.func.isRequired,
};
