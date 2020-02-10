/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import PropTypes from 'prop-types';

import { UIDatabase } from '../database';

import { Separator } from './Separator';
import { PrescriptionSummaryRow } from './PrescriptionSummaryRow';

import { recordKeyExtractor } from '../pages/dataTableUtilities';
import { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';
import { dispensingStrings } from '../localization';

/**
 * Simple layout component, rendering a title and a list of summary
 * rows on an elevated view.
 *
 * @param {Object} transaction
 */
export const PrescriptionSummary = ({ transaction }) => (
  <View style={localStyles.containerStyle}>
    <Text style={localStyles.titleStyle}>{dispensingStrings.item_details}</Text>
    <FlatList
      data={transaction?.getTransactionBatches(UIDatabase) ?? []}
      ItemSeparatorComponent={Separator}
      renderItem={PrescriptionSummaryRow}
      keyExtractor={recordKeyExtractor}
    />
  </View>
);

const localStyles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 50,
    marginBottom: 10,
    padding: 10,
  },
  titleStyle: {
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: SUSSOL_ORANGE,
    marginVertical: 5,
  },
});

PrescriptionSummary.defaultProps = { transaction: null };
PrescriptionSummary.propTypes = { transaction: PropTypes.object };
