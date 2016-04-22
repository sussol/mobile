/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

export default function SupplierInvoicesPage(props) {
  return (
    <View style={props.style}>
      <Text>Supplier Invoices go here.</Text>
    </View>
  );
}

SupplierInvoicesPage.propTypes = {
  style: View.propTypes.style,
};
