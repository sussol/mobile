/* eslint-disable react/forbid-prop-types */
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
import { InfoBadge } from '../widgets';

import { navStrings } from '../localization';

import { SETTINGS_KEYS } from '../settings';

import globalStyles, { APP_FONT_FAMILY, SHADOW_BORDER, GREY, WARMER_GREY } from '../globalStyles';
import {
  gotoCustomerInvoices,
  gotoCustomerRequisitions,
  gotoSupplierInvoices,
  gotoSupplierRequisitions,
  gotoStock,
  gotoStocktakes,
  gotoRealmExplorer,
} from '../navigation/actions';

const { SYNC_SITE_NAME } = SETTINGS_KEYS;

class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.databaseListenerId = null;
  }

  componentWillMount() {
    const { database } = this.props;

    this.databaseListenerId = database.addListener(
      // Ensure that language changes in login modal are re-rendered onto the MenuPage.
      (_, recordType) => recordType === 'Setting' && this.forceUpdate()
    );
  }

  componentWillUnmount() {
    const { database } = this.props;
    database.removeListener(this.databaseListenerId);
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
    const {
      isInAdminMode,
      logOut,
      navigateToCustomerInvoices,
      navigateToCustomerRequisitions,
      navigateToStock,
      navigateToStocktakes,
      navigateToSupplierInvoices,
      navigateToSupplierRequisitions,
      navigateToRealmExplorer,
    } = this.props;

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
            <InfoBadge routeName="customerInvoices" mainWrapperStyle={localStyles.InfoBadgeWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.customer_invoices}
                onPress={navigateToCustomerInvoices}
              />
            </InfoBadge>
            <InfoBadge
              routeName="customerRequisitions"
              mainWrapperStyle={localStyles.InfoBadgeWrapper}
            >
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.customer_requisitions}
                onPress={navigateToCustomerRequisitions}
              />
            </InfoBadge>
          </View>

          <View style={[localStyles.container, localStyles.centralContainer]}>
            <Image
              style={localStyles.image}
              resizeMode="contain"
              // eslint-disable-next-line global-require
              source={require('../images/menu_truck.png')}
            />
            <InfoBadge routeName="supplierInvoices" mainWrapperStyle={localStyles.InfoBadgeWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.supplier_invoices}
                onPress={navigateToSupplierInvoices}
              />
            </InfoBadge>
            <InfoBadge
              routeName="supplierRequisitions"
              mainWrapperStyle={localStyles.InfoBadgeWrapper}
            >
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.supplier_requisitions}
                onPress={navigateToSupplierRequisitions}
              />
            </InfoBadge>
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
              onPress={navigateToStock}
            />
            <InfoBadge routeName="stocktakes" mainWrapperStyle={localStyles.InfoBadgeWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.stocktakes}
                onPress={navigateToStocktakes}
              />
            </InfoBadge>
            {isInAdminMode && (
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text="Realm Explorer"
                onPress={navigateToRealmExplorer}
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

const actionCreators = {
  navigateToCustomerInvoices: gotoCustomerInvoices,
  navigateToCustomerRequisitions: gotoCustomerRequisitions,
  navigateToStock: gotoStock,
  navigateToStocktakes: gotoStocktakes,
  navigateToSupplierInvoices: gotoSupplierInvoices,
  navigateToSupplierRequisitions: gotoSupplierRequisitions,
  navigateToRealmExplorer: gotoRealmExplorer,
};

export const MenuPage = connect(
  null,
  actionCreators
)(Menu);

Menu.defaultProps = {
  isInAdminMode: false,
};

Menu.propTypes = {
  database: PropTypes.object.isRequired,
  isInAdminMode: PropTypes.bool,
  logOut: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  navigateToCustomerInvoices: PropTypes.func.isRequired,
  navigateToCustomerRequisitions: PropTypes.func.isRequired,
  navigateToStock: PropTypes.func.isRequired,
  navigateToStocktakes: PropTypes.func.isRequired,
  navigateToSupplierInvoices: PropTypes.func.isRequired,
  navigateToSupplierRequisitions: PropTypes.func.isRequired,
  navigateToRealmExplorer: PropTypes.func.isRequired,
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
