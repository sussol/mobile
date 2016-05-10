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
import Button from '../widgets/Button';

export default function StockHistoriesPage(props) {
  return (
    <View style={props.style}>
      <Text>Stock Histories go here.</Text>
      <Button
        text="View a stock history"
        onPress={() => props.navigateTo('stockHistory', 'Stock History')}
      />
    </View>
  );
}

StockHistoriesPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
