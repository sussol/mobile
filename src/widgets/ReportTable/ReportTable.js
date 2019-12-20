/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import PropTypes from 'prop-types';
import { LIGHT_GREY } from '../../globalStyles';
import { ReportRow } from './ReportRow';

export const ReportTable = ({ rows, header }) => {
  const renderItem = ({ item, index }) => <ReportRow rowData={item} rowIndex={index} />;

  const renderHeader = () => <ReportRow rowData={header} rowIndex={0} />;

  // TODO: KeyExtractor should be altered to not use the index.
  return (
    <View style={localStyles.container}>
      <FlatList
        data={rows}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        keyExtractor={(_, index) => `${index}`}
      />
    </View>
  );
};

ReportTable.propTypes = {
  header: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_GREY,
  },
});
