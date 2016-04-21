
/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function TableButton(props) {
  return (
    <TouchableOpacity style={styles.tableButton} onPress={props.onPress}>
      {props.children}
    </TouchableOpacity>
  );
}

TableButton.propTypes = {
  children: React.PropTypes.any,
  onPress: React.PropTypes.func,
};

const styles = StyleSheet.create({
  tableButton: {
    flex: 0.5,
    backgroundColor: 'green',
  },
});
