/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

export default function SupplierInvoicePage(props) {
  return (
    <View style={props.style}>
      <Text>A specific supplier invoice.</Text>
    </View>
  );
}

SupplierInvoicePage.propTypes = {
  style: View.propTypes.style,
};
