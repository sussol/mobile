/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

export function Header(props) {
  const { children, style, ...viewProps } = props;
  return (
    <View {...viewProps} style={[defaultStyles.header, style]}>
      {children}
    </View>
  );
}

Header.propTypes = {
  style: React.View.propTypes.style,
  children: React.PropTypes.any,
};

const defaultStyles = StyleSheet.create({
  header: {
    flex: 0.08,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    backgroundColor: 'grey',
  },
});
