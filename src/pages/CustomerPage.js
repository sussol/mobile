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

export default function CustomerPage(props) {
  return (
    <View style={props.style}>
      <Text>A specific customer, with their billing address and invoices.</Text>
        <Button
          text="View Existing Customer Invoice"
          onPress={() => props.navigateTo('customerInvoice', 'Invoice Num')}
        />
        <Button
          text="New Customer Invoice"
          onPress={() => props.navigateTo('customerInvoice', 'Invoice Num')}
        />
    </View>
  );
}

CustomerPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
