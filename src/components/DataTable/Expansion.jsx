/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  expansion: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'magenta',
  },
});

export default function Expansion(props) {
  return (
    <View style={styles.expansion}>
      {props.children}
    </View>
  );
}
Expansion.propTypes = {
  children: React.PropTypes.any,
};
