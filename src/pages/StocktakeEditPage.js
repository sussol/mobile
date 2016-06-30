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
          text="Or Manage a Stocktake"
          onPress={() => props.navigateTo('stocktakeManager', 'Manage Stocktake')}
        />
    </View>
  );
}

StocktakeEditPage.propTypes = {
  style: View.propTypes.style,
  navigateTo: React.PropTypes.func.isRequired,
};
