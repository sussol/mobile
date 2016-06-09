/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';
import { Button } from '../widgets';

export function StocktakesPage(props) {
  return (
    <View style={props.style}>
      <Text>Stocktakes go here.</Text>
      <Button
        style={globalStyles.button}
        textStyle={globalStyles.buttonText}
        text="Edit"
        onPress={() => props.navigateTo('stocktakeEditor', 'Edit Stocktake')}
      />
      <Button
        style={globalStyles.button}
        textStyle={globalStyles.buttonText}
        text="New"
        onPress={() => props.navigateTo('stocktakeManager', 'Create Stocktake')}
      />
    </View>
  );
}

StocktakesPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
