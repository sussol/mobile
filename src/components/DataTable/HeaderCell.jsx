/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

const styles = StyleSheet.create({
  headerCell: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default function HeaderCell(props) {
  if (typeof props.onPress === 'function') {
    return (
      <TouchableOpacity
        style={[styles.headerCell, { flex: props.width }]}
        onPress={props.onPress}
      >
        <Text style={props.style}>
          {props.children}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.headerCell, { flex: props.width }]}>
      <Text style={props.style}>
        {props.children}
      </Text>
    </View>
  );
}
HeaderCell.propTypes = {
  style: React.PropTypes.number,
  width: React.PropTypes.number,
  onPress: React.PropTypes.func,
  children: React.PropTypes.any,
};
