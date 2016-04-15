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
  expansionView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'purple',
  },
});

export default function ExpansionView(props) {
  return (
    <View style={styles.expansionView}>
      {props.children}
    </View>
  );
}
ExpansionView.propTypes = {
  children: React.PropTypes.any,
};
