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

export function CustomersPage(props) {
  return (
    <View style={props.style}>
      <Text>Customers go here.</Text>
        <Button
          style={globalStyles.button}
          textStyle={globalStyles.buttonText}
          text="Specific Customer"
          onPress={() => props.navigateTo('customer', 'Customer Name')}
        />
        <Button
          style={globalStyles.button}
          textStyle={globalStyles.buttonText}
          text="New Customer Invoice"
          onPress={() => props.navigateTo('customerInvoice', 'Invoice Num')}
        />
    </View>
  );
}

CustomersPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
