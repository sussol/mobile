/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { NumberLabelRow } from './NumberLabelRow';
import { DetailRow } from './DetailRow';
import { SimpleLabel } from './SimpleLabel';
import { TouchableNoFeedback } from './DataTable';

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
  const { itemName, itemCode, totalQuantity, note } = item;

  const details = [{ label: 'Code', text: itemCode }];

  return (
    <TouchableNoFeedback style={localStyles.mainContainer}>
      <NumberLabelRow text={itemName} number={totalQuantity} />
      <View style={localStyles.marginFive} />
      <DetailRow details={details} />
      <View style={localStyles.marginFive} />
      <SimpleLabel label="Directions" text={note} />
    </TouchableNoFeedback>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: { justifyContent: 'space-evenly', flex: 1, flexDirection: 'column' },
  marginFive: { margin: 5 },
});

PrescriptionSummaryRow.propTypes = { item: PropTypes.object.isRequired };
