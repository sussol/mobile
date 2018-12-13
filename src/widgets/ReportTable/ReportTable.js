/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import PropTypes from 'prop-types';
import { LIGHT_GREY } from '../../globalStyles';
import { ReportRow } from './ReportRow';

/**
 * Simple wrapper around a FlatList, which renders two arrays. One consisting of headers
 * and another 2D array, consisting of the content for each cell.
 * @prop  {array}   headers   Array of strings corresponding to each column heading.
 * @prop  {array}   rows      2D Array of strings representing each cell for a row.
 */

export class ReportTable extends React.Component {
  renderItem = ({ item, index }) => {
    return <ReportRow rowData={item} index={index} />;
  };

  renderHeader = () => {
    return <ReportRow rowData={this.props.headers} isHeader index={0} />;
  };

  render() {
    return (
      <View style={[localStyles.container]}>
        {this.renderHeader()}
        <FlatList
          data={this.props.rows}
          renderItem={this.renderItem}
          keyExtractor={(_, index) => `${index}`}
        />
      </View>
    );
  }
}

ReportTable.propTypes = {
  headers: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_GREY,
  },
});
