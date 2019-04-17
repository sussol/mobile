/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import { SimpleTable } from './SimpleTable';

/**
 * Simple component which renders SimpleTable components
 * on top one one another. By default will use 100% of
 * the width and height of it's parent. To give space
 * between each table, the tablesHeight prop is the space
 * all tables should occupy, leaving room between each if
 * < 100%. i.e : 90% will occupy 90% of the height and use
 * flexbox space-between, so 10% of the height is split evenly
 * between each table.
 */
export class StackedTables extends React.PureComponent {
  render() {
    const { data, additionalTableProps, tablesHeight } = this.props;
    const { containerStyle } = localStyles(this.props);
    return (
      <View style={containerStyle}>
        {data.map((datum, index) => {
          const { title = 'default' } = datum;
          return (
            <View key={`${title + index}`} style={{ height: `${tablesHeight / data.length}%` }}>
              <SimpleTable {...datum} {...additionalTableProps} />
            </View>
          );
        })}
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
  tablesHeight: 95,
};

StackedTables.propTypes = {
  data: PropTypes.array.isRequired,
  additionalTableProps: PropTypes.object,
  tablesHeight: PropTypes.number,
};

export default StackedTables;
