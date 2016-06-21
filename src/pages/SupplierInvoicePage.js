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

export function SupplierInvoicePage(props) {
  return (
    <View style={props.style}>
      <Text>A specific supplier invoice.</Text>
    </View>
  );
}

SupplierInvoicePage.propTypes = {
  style: View.propTypes.style,
};
