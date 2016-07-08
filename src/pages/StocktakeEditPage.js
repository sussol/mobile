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

import { PageButton } from '../widgets';

export function StocktakeEditPage(props) {
  return (
    <View style={props.style}>
      <Text>You can edit a stocktake.</Text>
        <PageButton
          text="Or Manage a Stocktake"
          onPress={() => props.navigateTo('stocktakeManager', 'Manage Stocktake')}
        />
    </View>
  );
}

StocktakeEditPage.propTypes = {
  style: View.propTypes.style,
  stocktake: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
};
