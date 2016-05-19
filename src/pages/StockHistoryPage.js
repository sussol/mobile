/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';

export function StockHistoryPage(props) {
  return (
    <View style={props.style}>
      <Text>You can interact with a Stock History.</Text>
    </View>
  );
}

StockHistoryPage.propTypes = {
  style: View.propTypes.style,
  navigateTo: React.PropTypes.func.isRequired,
};
