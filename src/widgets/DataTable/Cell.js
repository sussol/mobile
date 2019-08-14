import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

const Cell = React.memo(({ value }) => {
  console.log(`- Cell: ${value}`);
  return (
    <View style={defaultStyles.cell}>
      <Text>{value}</Text>
    </View>
  );
});

Cell.propTypes = {
  value: PropTypes.onOfType(PropTypes.string, PropTypes.number),
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
