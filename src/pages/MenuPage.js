/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Image, StyleSheet, Text, View, ToastAndroid } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';

import { navStrings } from '../localization';
import { SETTINGS_KEYS } from '../settings';

import globalStyles, { APP_FONT_FAMILY, SHADOW_BORDER, GREY, WARMER_GREY } from '../globalStyles';

const { SYNC_SITE_NAME } = SETTINGS_KEYS;

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.databaseListenerId = null;
  }

  exportData = async () => {
    const { settings, database } = this.props;
    const syncSiteName = settings.get(SYNC_SITE_NAME);
    const { success, error } = await database.exportData(syncSiteName);
    let toastMessage;
    if (success) {
      toastMessage = 'Exported data file';
    } else {
      const { message } = error;
      toastMessage = `Couldn't export data: ${message}`;
    }
    ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
  };

  render() {
    const { isInAdminMode, logOut, navigateTo } = this.props;
    return (
      <View style={[globalStyles.pageContentContainer, localStyles.pageContentContainer]}>
        <View style={[globalStyles.horizontalContainer, localStyles.horizontalContainer]}>
          <View style={localStyles.container}>
            <Image
              style={localStyles.image}
              resizeMode="contain"
              // eslint-disable-next-line global-require
              source={require('../images/menu_people.png')}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.customer_invoices}
              onPress={() => navigateTo('customerInvoices', navStrings.customer_invoices)}
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
              // eslint-disable-next-line global-require
              source={require('../images/menu_truck.png')}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.supplier_invoices}
              onPress={() => navigateTo('supplierInvoices', navStrings.supplier_invoices)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={navStrings.supplier_requisitions}
              onPress={() => navigateTo('supplierRequisitions', navStrings.supplier_requisitions)}
            />
            {isInAdminMode && (
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text="Export Data"
                onPress={this.exportData}
              />
            )}
          </View>

          <View style={localStyles.container}>
            <Image
              style={localStyles.image}
              resizeMode="contain"
              // eslint-disable-next-line global-require
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
            {isInAdminMode && (
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text="Realm Explorer"
                onPress={() => navigateTo('realmExplorer', 'Database Contents')}
              />
            )}
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

export const MenuPage = connect()(Menu);

/* eslint-disable react/require-default-props, react/forbid-prop-types */
Menu.propTypes = {
  database: PropTypes.object.isRequired,
  isInAdminMode: PropTypes.bool,
  logOut: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
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
