/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from 'react-native-ui-components';
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
    const { isInAdminMode, logOut, navigateTo } = this.props;
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
              onPress={() => navigateTo(
                'customerInvoices', navStrings.customer_invoices)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.customer_requisitions}
              onPress={() => navigateTo('customerRequisitions', navStrings.customer_requisitions)}
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
              onPress={() => navigateTo(
                'supplierInvoices', navStrings.supplier_invoices)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.supplier_requisitions}
              onPress={() => navigateTo('supplierRequisitions', navStrings.supplier_requisitions)}
            />
            {isInAdminMode &&
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text="Realm Explorer"
                onPress={() => navigateTo('realmExplorer', 'Database Contents')}
              />
            }
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
              onPress={() => navigateTo('stock', navStrings.current_stock)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.stocktakes}
              onPress={() => navigateTo('stocktakes', navStrings.stocktakes)}
            />
          </View>
        </View>
        <View style={globalStyles.bottomContainer}>
          <Icon.Button
            name="power-off"
            underlayColor="#888888"
            iconStyle={localStyles.bottomIcon}
            borderRadius={4}
            backgroundColor="rgba(255,255,255,0)"
            onPress={logOut}
          >
            <Text style={localStyles.logOutText}>{navStrings.log_out}</Text>
          </Icon.Button>
        </View>
      </View>
    );
  }
}

MenuPage.propTypes = {
  database: PropTypes.object.isRequired,
  isInAdminMode: PropTypes.bool,
  logOut: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
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
