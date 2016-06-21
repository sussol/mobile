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

export function CustomerInvoicePage(props) {
  return (
    <View style={props.style}>
      <Text>{props.invoice.id}</Text>
    </View>
  );
}

CustomerInvoicePage.propTypes = {
  style: View.propTypes.style,
  invoice: React.PropTypes.object,
};
