/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import currency from '../localization/currency';

import { NumberLabelRow } from './NumberLabelRow';
import { SimpleLabel } from './SimpleLabel';
import { TouchableNoFeedback } from './DataTable';

import { formInputStrings, generalStrings, dispensingStrings } from '../localization';

/**
 * Simple layout component for primary use within the PrescriptionSummary
 * component.
 *
 * Simply lays out a TransactionItem record showing details related to
 * the prescription it is related from.
 *
 * @param {Object} item A TransactionItem record to display details for.
 */
export const PrescriptionSummaryRow = ({ item }) => {
  const { itemName, itemCode, totalQuantity, note, totalPrice } = item;

  return (
    <TouchableNoFeedback style={localStyles.mainContainer}>
      <NumberLabelRow text={itemName} number={totalQuantity} />
      <View style={localStyles.marginFive} />
      <SimpleLabel label={formInputStrings.code} text={itemCode} />
      <View style={localStyles.marginFive} />
      <SimpleLabel label={dispensingStrings.directions} text={note} />
      <View style={localStyles.marginFive} />
      <SimpleLabel label={generalStrings.price} text={currency(totalPrice).format()} />
    </TouchableNoFeedback>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: { justifyContent: 'space-evenly', flex: 1, flexDirection: 'column' },
  marginFive: { margin: 5 },
});

PrescriptionSummaryRow.propTypes = { item: PropTypes.object.isRequired };
