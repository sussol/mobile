
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
  const { style, onPress, children, ...touchableOpacityProps } = props;
  return (
    <TouchableOpacity
      {...touchableOpacityProps}
      style={[styles.tableButton, style]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}

TableButton.propTypes = {
  style: React.PropTypes.number,
  onPress: React.PropTypes.func,
  children: React.PropTypes.any,
};

const styles = StyleSheet.create({
  tableButton: {
    flex: 1,
    backgroundColor: 'green',
  },
});
