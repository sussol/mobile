/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Image,
  StyleSheet,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';
import {
  Button,
} from '../widgets';

export default function MenuPage(props) {
  return (
    <View style={[globalStyles.horizontalContainer, { flex: 1 }]}>
      <View style={localStyles.container}>
        <Image style={localStyles.image} source={{ uri: 'http://msupply.org.nz//images/274.jpg' }} />
        <Button
          style={globalStyles.menuButton}
          textStyle={globalStyles.menuButtonText}
          text="Customers"
          onPress={() => props.navigateTo('customers', 'Customers')}
        />
        <Button
          style={globalStyles.menuButton}
          textStyle={globalStyles.menuButtonText}
          text="Customer Invoices"
          onPress={() => props.navigateTo('customerInvoices', 'Customer Invoices')}
        />
      </View>

      <View style={localStyles.container}>
        <Image style={localStyles.image} source={{ uri: 'http://msupply.org.nz//images/274.jpg' }} />
        <Button
          style={globalStyles.menuButton}
          textStyle={globalStyles.menuButtonText}
          text="Supplier Invoices"
          onPress={() => props.navigateTo('supplierInvoices', 'Supplier Invoices')}
        />
        <Button
          style={globalStyles.menuButton}
          textStyle={globalStyles.menuButtonText}
          text="Stock"
          onPress={() => props.navigateTo('stock', 'Stock')}
        />
      </View>

      <View style={localStyles.container}>
        <Image style={localStyles.image} source={{ uri: 'http://msupply.org.nz//images/274.jpg' }} />
        <Button
          style={globalStyles.menuButton}
          textStyle={globalStyles.menuButtonText}
          text="Stocktakes"
          onPress={() => props.navigateTo('stocktakes', 'Stocktakes')}
        />
        <Button
          style={globalStyles.menuButton}
          textStyle={globalStyles.menuButtonText}
          text="Stock Histories"
          onPress={() => props.navigateTo('stockHistories', 'Stock Histories')}
        />
      </View>
    </View>
  );
}

MenuPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  image: {
    height: 150,
    width: 150,
    backgroundColor: 'blue',
  },
});
