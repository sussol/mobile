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

export function StocktakeManager(props) {
  return (
    <View style={props.style}>
      <Text>You can manage a Stocktake.</Text>
    </View>
  );
}

StocktakeManager.propTypes = {
  style: View.propTypes.style,
};
