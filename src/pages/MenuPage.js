/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Button,
} from '../widgets';
import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles, {
  APP_FONT_FAMILY,
  DARK_GREY,
  DARKER_GREY,
  SHADOW_BORDER,
} from '../globalStyles';

export function MenuPage(props) {
  return (
    <View style={[globalStyles.pageContentContainer, localStyles.pageContentContainer]}>
      <View style={[globalStyles.horizontalContainer, localStyles.horizontalContainer]}>
        <View style={localStyles.container}>
          <Image
            style={localStyles.image}
            resizeMode="contain"
            source={require('../images/menu_people.png')}
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
            text="Customer Invoices"
            onPress={() => props.navigateTo('customerInvoices', 'Customer Invoices')}
          />
        </View>

        <View style={localStyles.container}>
          <Image
            style={localStyles.image}
            resizeMode="contain"
            source={require('../images/menu_truck.png')}
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
            text="Stock Histories"
            onPress={() => props.navigateTo('stockHistories', 'Stock Histories')}
          />
        </View>

        <View style={localStyles.container}>
          <Image
            style={localStyles.image}
            resizeMode="contain"
            source={require('../images/menu_pc_clipboard.png')}
          />
          <Button
            style={globalStyles.menuButton}
            textStyle={globalStyles.menuButtonText}
            text="Current Stock"
            onPress={() => props.navigateTo('stock', 'Stock')}
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
            text="Realm Explorer"
            onPress={() => props.navigateTo('realmExplorer', 'Database Contents')}
          />
        </View>
      </View>
      <View style={[globalStyles.horizontalContainer, { flex: 1, marginHorizontal: 20 }]}>
        <Icon.Button
          name="power-off"
          underlayColor="#888888"
          iconStyle={localStyles.logOutIcon}
          borderRadius={4}
          backgroundColor="rgba(255,255,255,0)"
          onPress={props.logOut()}
        >
          <Text style={localStyles.logOutText}>LOG OUT</Text>
        </Icon.Button>
      </View>
    </View>
  );
}

MenuPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  logOut: React.PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  pageContentContainer: {
    padding: 0,
  },
  horizontalContainer: {
    flex: 9,
  },
  container: {
    alignSelf: 'stretch',
    flex: 1,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    borderColor: SHADOW_BORDER,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  image: {
    height: 150,
    width: 150,
    marginBottom: 25,
  },
  logOutText: {
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
  },
  logOutIcon: {
    color: DARK_GREY,
  },
});
