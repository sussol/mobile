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

export function CustomerInvoicePage(props) {
  return (
    <View style={props.style}>
      <Text>You can edit a Customer Invoice.</Text>
    </View>
  );
}

CustomerInvoicePage.propTypes = {
  style: View.propTypes.style,
};
