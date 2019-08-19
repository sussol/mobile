import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Renders a cell that displays a string/number value within
 * a react-native `Text` component.
 *
 * @param {string|number} value The value to render in cell
 */
const Cell = React.memo(({ value }) => {
  console.log(`- Cell: ${value}`);
  return (
    <View style={defaultStyles.cell}>
      <Text>{value}</Text>
    </View>
  );
});

Cell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Cell.defaultProps = {
  value: '',
};

const defaultStyles = StyleSheet.create({
  cell: {
    flex: 1,
    backgroundColor: 'yellow',
    justifyContent: 'center',
  },
});

export default Cell;
