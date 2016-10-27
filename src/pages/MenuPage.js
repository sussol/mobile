/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../widgets';
import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles, {
  APP_FONT_FAMILY,
  SHADOW_BORDER,
  GREY,
  WARMER_GREY,
} from '../globalStyles';

import { navStrings } from '../localization';

export class MenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.databaseListenerId = null;
  }

  componentWillMount() {
    this.databaseListenerId = this.props.database.addListener(
      // Ensure that language changes in login modal are re-rendered onto the MenuPage
      (changeType, recordType) => recordType === 'Setting' && this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.props.database.removeListener(this.databaseListenerId);
  }

  render() {
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
              text={navStrings.customer_invoices}
              onPress={() => this.props.navigateTo(
                'customerInvoices', navStrings.customer_invoices)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.customers}
              onPress={() => this.props.navigateTo('customers', navStrings.customers)}
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
              text={navStrings.supplier_invoices}
              onPress={() => this.props.navigateTo(
                'supplierInvoices', navStrings.supplier_invoices)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.requisitions}
              onPress={() => this.props.navigateTo('requisitions', navStrings.requisitions)}
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
              text={navStrings.current_stock}
              onPress={() => this.props.navigateTo('stock', navStrings.current_stock)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.stocktakes}
              onPress={() => this.props.navigateTo('stocktakes', navStrings.stocktakes)}
            />
            {this.props.adminMode &&
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text="Realm Explorer"
                onPress={() => this.props.navigateTo('realmExplorer', 'Database Contents')}
              />
            }
          </View>
        </View>
        <View style={[globalStyles.horizontalContainer, { flex: 1, marginHorizontal: 20 }]}>
          <Icon.Button
            name="power-off"
            underlayColor="#888888"
            iconStyle={localStyles.bottomIcon}
            borderRadius={4}
            backgroundColor="rgba(255,255,255,0)"
            onPress={this.props.logOut}
          >
            <Text style={localStyles.logOutText}>{navStrings.log_out}</Text>
          </Icon.Button>
        </View>
      </View>
    );
  }
}

MenuPage.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  database: React.PropTypes.object,
  logOut: React.PropTypes.func.isRequired,
  settings: React.PropTypes.object.isRequired,
  adminMode: React.PropTypes.bool,
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
  bottomIcon: {
    color: GREY,
  },
});
