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

export function StocktakeEditor(props) {
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

StocktakeEditor.propTypes = {
  style: View.propTypes.style,
  navigateTo: React.PropTypes.func.isRequired,
};
