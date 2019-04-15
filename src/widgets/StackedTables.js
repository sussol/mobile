/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';
import MiniTable from './SimpleTable';

import { generateUUID } from '../database';

export class StackedTables extends React.PureComponent {
  render() {
    const { data, additionalTableProps, tableHeight } = this.props;
    const { containerStyle } = localStyles(this.props);
    return (
      <View style={containerStyle}>
        {data.map(datum => (
          <View key={generateUUID()} style={{ height: `${tableHeight / data.length}%` }}>
            <MiniTable {...datum} {...additionalTableProps} />
          </View>
        ))}
      </View>
    );
  }
}

const localStyles = ({ containerStyle }) =>
  StyleSheet.create({
    containerStyle: {
      backgroundColor: 'white',
      height: '95%',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      ...containerStyle,
    },
  });

StackedTables.defaultProps = {
  additionalTableProps: {},
  tableHeight: 95,
};

StackedTables.propTypes = {
  data: PropTypes.array.isRequired,
  additionalTableProps: PropTypes.object,
  tableHeight: PropTypes.number,
};

export default StackedTables;
