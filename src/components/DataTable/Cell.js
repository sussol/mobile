/* @flow weak */

/**
 * OfflineMobile Cell component
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default function Cell(props) {
  return (
    <View style={[styles.cell, { flex: props.width }]}>
      <Text style={props.style}>
        {props.children}
      </Text>
    </View>
  );
}
Cell.propTypes = {
  style: React.PropTypes.object,
  width: React.PropTypes.number,
  children: React.PropTypes.any,
};
Cell.defaultProps = {
  width: 1,
};
