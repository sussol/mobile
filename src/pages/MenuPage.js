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
  Button,
} from '../widgets';

export default function MenuPage(props) {
  return (
    <View style={styles.container}>
      <Button
        text="Stock"
        onPress={() => props.navigateTo('stock', 'Stock')}
      />
      <Button
        text="Customers"
        onPress={() => props.navigateTo('customers', 'Customers')}
      />
      <Button
        text="Stocktakes"
        onPress={() => props.navigateTo('stocktakes', 'Stocktakes')}
      />
      <Button
        text="Supplier Invoices"
        onPress={() => props.navigateTo('supplierInvoices', 'Supplier Invoices')}
      />
      <Button
        text="Customer Invoices"
        onPress={() => props.navigateTo('customerInvoices', 'Customer Invoices')}
      />
      <Button
        text="Stock Histories"
        onPress={() => props.navigateTo('stockHistories', 'Stock Histories')}
      />
    </View>
  );
}

MenuPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
