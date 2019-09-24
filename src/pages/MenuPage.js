/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, StyleSheet, Text, View, ToastAndroid } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BadgeSet } from '../widgets';

import { navStrings, generalStrings } from '../localization';

import { SETTINGS_KEYS } from '../settings';

import globalStyles, { APP_FONT_FAMILY, SHADOW_BORDER, GREY, WARMER_GREY } from '../globalStyles';

const { SYNC_SITE_NAME } = SETTINGS_KEYS;

export class MenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customerRequisition: [
        {
          count: 0,
          type: 'unfinalised',
          title: `${
            generalStrings.unfinalised
          } ${generalStrings.customerRequisitions.toLowerCase()}`,
        },
      ],
      supplierRequisition: [
        {
          count: 0,
          type: 'unfinalised',
          title: `${
            generalStrings.unfinalised
          } ${generalStrings.supplierRequisitions.toLowerCase()}`,
        },
      ],
      supplierInvoice: [
        {
          count: 0,
          type: 'unfinalised',
          title: `${generalStrings.unfinalised} ${generalStrings.supplierInvoices.toLowerCase()}`,
        },
      ],
      customerInvoice: [
        {
          count: 0,
          type: 'unfinalised',
          title: `${generalStrings.unfinalised} ${generalStrings.customerInvoices.toLowerCase()}`,
        },
      ],
      stocktakes: [
        {
          count: 0,
          type: 'unfinalised',
          title: `${generalStrings.unfinalised} ${generalStrings.stocktakes.toLowerCase()}`,
        },
      ],
    };

    this.databaseListenerId = null;
  }

  componentWillMount() {
    const { database } = this.props;

    this.databaseListenerId = database.addListener(
      // Ensure that language changes in login modal are re-rendered onto the MenuPage.
      (_, recordType) => recordType === 'Setting' && this.forceUpdate()
    );
  }

  componentWillReceiveProps(props) {
    // eslint-disable-next-line react/prop-types
    const { topRoute } = props;
    if (topRoute) this.refreshData();
  }

  componentWillUnmount() {
    const { database } = this.props;

    database.removeListener(this.databaseListenerId);
  }

  refreshData = () => {
    const { database } = this.props;

    // this.setState({
    //   customerInvoice: {
    //     finalised: {
    //       count: database.objects('CustomerInvoice').filtered('status != "finalised"').length,
    //     },
    //   },
    // });

    this.setState(prevState => ({
      customerRequisition: prevState.customerRequisition.map(obj => {
        // eslint-disable-next-line default-case
        switch (obj.type) {
          case 'unfinalised':
            return {
              ...obj,
              count: database.objects('ResponseRequisition').filtered('status != "finalised"')
                .length,
            };
        }
        return null;
      }),
      supplierRequisition: prevState.supplierRequisition.map(obj => {
        // eslint-disable-next-line default-case
        switch (obj.type) {
          case 'unfinalised':
            return {
              ...obj,
              count: database.objects('RequestRequisition').filtered('status != "finalised"')
                .length,
            };
        }
        return null;
      }),
      supplierInvoice: prevState.supplierInvoice.map(obj => {
        // eslint-disable-next-line default-case
        switch (obj.type) {
          case 'unfinalised':
            return {
              ...obj,
              count: database.objects('SupplierInvoice').filtered('status != "finalised"').length,
            };
        }
        return null;
      }),
      stocktakes: prevState.stocktakes.map(obj => {
        // eslint-disable-next-line default-case
        switch (obj.type) {
          case 'unfinalised':
            return {
              ...obj,
              count: database.objects('Stocktake').filtered('status != "finalised"').length,
            };
        }
        return null;
      }),
      customerInvoice: prevState.customerInvoice.map(obj => {
        // eslint-disable-next-line default-case
        switch (obj.type) {
          case 'unfinalised':
            return {
              ...obj,
              count: database.objects('CustomerInvoice').filtered('status != "finalised"').length,
            };
        }
        return null;
      }),
    }));
  };

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
    const {
      customerInvoice,
      customerRequisition,
      supplierRequisition,
      supplierInvoice,
      stocktakes,
    } = this.state;

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
            <BadgeSet info={customerInvoice} mainWrapperStyle={localStyles.badgeSetWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.customer_invoices}
                onPress={() => navigateTo('customerInvoices', navStrings.customer_invoices)}
              />
            </BadgeSet>
            <BadgeSet info={customerRequisition} mainWrapperStyle={localStyles.badgeSetWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.customer_requisitions}
                onPress={() => navigateTo('customerRequisitions', navStrings.customer_requisitions)}
              />
            </BadgeSet>
          </View>

          <View style={[localStyles.container, localStyles.centralContainer]}>
            <Image
              style={localStyles.image}
              resizeMode="contain"
              // eslint-disable-next-line global-require
              source={require('../images/menu_truck.png')}
            />
            <BadgeSet info={supplierInvoice} mainWrapperStyle={localStyles.badgeSetWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.supplier_invoices}
                onPress={() => navigateTo('supplierInvoices', navStrings.supplier_invoices)}
              />
            </BadgeSet>
            <BadgeSet info={supplierRequisition} mainWrapperStyle={localStyles.badgeSetWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.supplier_requisitions}
                onPress={() => navigateTo('supplierRequisitions', navStrings.supplier_requisitions)}
              />
            </BadgeSet>
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
            <BadgeSet info={stocktakes} mainWrapperStyle={localStyles.badgeSetWrapper}>
              <Button
                style={globalStyles.menuButton}
                textStyle={globalStyles.menuButtonText}
                text={navStrings.stocktakes}
                onPress={() => navigateTo('stocktakes', navStrings.stocktakes)}
              />
            </BadgeSet>
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

export default MenuPage;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
MenuPage.propTypes = {
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
