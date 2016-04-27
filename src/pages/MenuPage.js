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
        onPress={() => props.navigateTo('stock')}
      />
      <Button
        text="Stocktakes"
        onPress={() => props.navigateTo('stocktakes')}
      />
      <Button
        text="Supplier Invoices"
        onPress={() => props.navigateTo('supplierInvoices')}
      />
      <Button
        text="Customer Invoices"
        onPress={() => props.navigateTo('customerInvoices')}
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
