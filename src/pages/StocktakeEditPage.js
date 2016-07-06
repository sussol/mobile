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

import { Button } from '../widgets/Button';
import globalStyles from '../globalStyles';

export function StocktakeEditPage(props) {
  return (
    <View style={props.style}>
      <Text>You can edit a stocktake.</Text>
        <Button
          style={globalStyles.button}
          textStyle={globalStyles.buttonText}
          text="Manage this stocktake"
          onPress={() => props.navigateTo('stocktakeManager', 'Manage Stocktake', {
            stocktake: props.stocktake,
          })}
        />
    </View>
  );
}

StocktakeEditPage.propTypes = {
  style: View.propTypes.style,
  stocktake: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};
