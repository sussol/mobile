/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';

export function StocktakeManagePage(props) {
  return (
    <View style={props.style}>
      <Text>You can manage a Stocktake.</Text>
    </View>
  );
}

StocktakeManagePage.propTypes = {
  style: View.propTypes.style,
};
