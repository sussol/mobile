/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

import Button from '../widgets/Button';
import globalStyles from '../styles';

export default function StocktakeEditor(props) {
  return (
    <View style={props.style}>
      <Text>You can edit a stocktake.</Text>
        <Button
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
