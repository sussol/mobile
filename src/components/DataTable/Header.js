/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

export default function Header(props) {
  return (
    <View style={[styles.header, { flex: props.height }]}>
      {props.children}
    </View>
  );
}

Header.propTypes = {
  children: React.PropTypes.any,
  height: React.PropTypes.number,
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'grey',
  },
});
