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
  const { children, style, ...viewProps } = props;
  return (
    <View {...viewProps} style={[styles.header, style]}>
      {children}
    </View>
  );
}

Header.propTypes = {
  style: React.PropTypes.number,
  children: React.PropTypes.any,
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'grey',
  },
});
