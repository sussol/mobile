/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';
import {
  Button,
} from '../widgets';

export default function MenuPage(props) {
  return (
    <View style={styles.container}>
      <Button
        style={globalStyles.menuButton}
        textStyle={globalStyles.menuButtonText}
        text="Stock"
        onPress={() => props.navigateTo('stock', 'Stock')}
      />
      <Button
        style={globalStyles.menuButton}
        textStyle={globalStyles.menuButtonText}
        text="Customers"
        onPress={() => props.navigateTo('customers', 'Customers')}
      />
      <Button
        style={globalStyles.menuButton}
        textStyle={globalStyles.menuButtonText}
        text="Stocktakes"
        onPress={() => props.navigateTo('stocktakes', 'Stocktakes')}
      />
      <Button
        style={globalStyles.menuButton}
        textStyle={globalStyles.menuButtonText}
        text="Supplier Invoices"
        onPress={() => props.navigateTo('supplierInvoices', 'Supplier Invoices')}
      />
      <Button
        style={globalStyles.menuButton}
        textStyle={globalStyles.menuButtonText}
        text="Customer Invoices"
        onPress={() => props.navigateTo('customerInvoices', 'Customer Invoices')}
      />
      <Button
        style={globalStyles.menuButton}
        textStyle={globalStyles.menuButtonText}
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
