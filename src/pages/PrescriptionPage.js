/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';
import { connect } from 'react-redux';

import { Wizard } from '../widgets';
import { PrescriptionSummary } from '../widgets/PrescriptionSummary';

import {
  selectItem,
  selectPrescriber,
  switchTab,
  editQuantity,
} from '../reducers/PrescriptionReducer';

import { PrescriptionInfo } from '../widgets/PrescriptionInfo';
import { PrescriberSelect } from '../widgets/Tabs/PrescriberSelect';
import { ItemSelect } from '../widgets/Tabs/ItemSelect';

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

const Summary = connect(mapStateToProps)(({ transaction }) => (
  <View style={{ flex: 1 }}>
    <PrescriptionInfo />
    <PrescriptionSummary transaction={transaction} />
  </View>
));

const tabs = [PrescriberSelect, ItemSelect, Summary];
const titles = ['Select the Prescriber', 'Select items', 'Summary'];

export const Prescription = ({ currentTab, nextTab }) => (
  <Wizard tabs={tabs} titles={titles} currentTabIndex={currentTab} onPress={nextTab} />
);

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  currentTab: PropTypes.number.isRequired,
  nextTab: PropTypes.func.isRequired,
};
