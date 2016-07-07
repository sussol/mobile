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

import { PageButton } from '../widgets';

export function CustomerPage(props) {
  return (
    <View style={props.style}>
      <Text>A specific customer, with their billing address and invoices.</Text>
        <PageButton
          text="View Existing Customer Invoice"
          onPress={() => props.navigateTo('customerInvoice', 'Invoice Num')}
        />
        <PageButton
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
