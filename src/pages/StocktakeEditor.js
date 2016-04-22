/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

export default function StocktakesPage(props) {
  return (
    <View style={props.style}>
      <Text>You can edit a stocktake.</Text>
    </View>
  );
}

StocktakesPage.propTypes = {
  style: View.propTypes.style,
};
