/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

import {
  Actions,
} from 'react-native-router-flux';

import {
  Button,
} from '../widgets';

export default function MenuPage() {
  return (
    <View style={styles.container}>
      <Button
        text="Stock"
        onPress={Actions.stock}
      />
      <Button
        text="Stocktakes"
        onPress={Actions.stocktakes}
      />
      <Button
        text="Supplier Invoices"
        onPress={Actions.supplierInvoices}
      />
      <Button
        text="Customer Invoices"
        onPress={Actions.customerInvoices}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
