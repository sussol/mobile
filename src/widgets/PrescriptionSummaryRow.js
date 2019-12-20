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

export const PrescriptionSummaryRow = ({ item }) => {
  const { itemName, itemCode, totalQuantity, direction } = item;

  const details = React.useMemo([{ label: 'Code', text: itemCode }], []);

  return (
    <View style={localStyles.mainContainer}>
      <NumberLabelRow text={itemName} number={totalQuantity} />
      <View style={localStyles.marginFive} />
      <DetailRow details={details} />
      <View style={localStyles.marginFive} />
      <SimpleLabel label="Directions" text={direction} />
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: { justifyContent: 'space-evenly', flex: 1, flexDirection: 'column' },
  marginFive: { margin: 5 },
});

PrescriptionSummaryRow.propTypes = { item: PropTypes.object.isRequired };
