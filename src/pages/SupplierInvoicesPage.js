/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  View,
} from 'react-native';

import globalStyles from '../styles';
import Button from '../widgets/Button';

export default function SupplierInvoicesPage(props) {
  return (
    <View style={props.style}>
      <Text>Supplier Invoices go here.</Text>
        <Button
          text="View an invoice"
          onPress={() => props.navigateTo('supplierInvoice', 'Invoice Number')}
        />
    </View>
  );
}

SupplierInvoicesPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
