/* @flow weak */

/**
 * mSupply MobileAndroid
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
  SHADOW_BORDER,
  GREY,
  WARMER_GREY,
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
            text="Customer Invoices"
            onPress={() => props.navigateTo('customerInvoices', 'Customer Invoices')}
          />
          <Button
            style={globalStyles.menuButton}
            textStyle={globalStyles.menuButtonText}
            text="Customers"
            onPress={() => props.navigateTo('customers', 'Customers')}
          />
        </View>

        <View style={[localStyles.container, localStyles.centralContainer]}>
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
            text="Requistions"
            onPress={() => props.navigateTo('requisitions', 'Requistions')}
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
          onPress={props.logOut}
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
    justifyContent: 'space-between',
  },
  container: {
    alignSelf: 'stretch',
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 30,
    borderColor: SHADOW_BORDER,
    borderWidth: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  centralContainer: {
    marginHorizontal: 40,
  },
  image: {
    height: 150,
    width: 150,
    marginBottom: 30,
  },
  logOutText: {
    fontFamily: APP_FONT_FAMILY,
    color: WARMER_GREY,
  },
  logOutIcon: {
    color: GREY,
  },
});
