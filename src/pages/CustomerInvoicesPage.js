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

export default function CustomerInvoicesPage(props) {
  return (
    <View style={props.style}>
      <Text>Customer Invoices go here.</Text>
      <Button
        text="New Invoice"
        onPress={() => props.navigateTo('customerInvoice', 'New Invoice')}
      />
      <Button
        text="View/Edit an invoice"
        onPress={() => props.navigateTo('customerInvoice', 'Invoice Number')}
      />
    </View>
  );
}

CustomerInvoicesPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
