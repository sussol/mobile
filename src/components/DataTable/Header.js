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
  header: {
    flex: 0.08,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'grey',
  },
});

export default function Header(props) {
  return (
    <View style={styles.header}>
      {props.children}
    </View>
  );
}

Header.propTypes = {
  children: React.PropTypes.any,
};
