/* @flow weak */

/**
 * OfflineMobile dataTable Expansion
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

export default function Expansion(props) {
  const { children, style, ...viewProps } = props;
  return (
    <View {...viewProps} style={[styles.expansion, style]}>
      {children}
    </View>
  );
}

Expansion.propTypes = {
  style: React.PropTypes.number,
  children: React.PropTypes.any,
};

const styles = StyleSheet.create({
  expansion: {
    flex: 1,
    flexDirection: 'row',
  },
});
