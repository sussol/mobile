/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ReportChart } from '../widgets';
import { SETTINGS_KEYS } from '../settings';

const { SYNC_SITE_NAME } = SETTINGS_KEYS;

import globalStyles, { APP_FONT_FAMILY, SHADOW_BORDER, GREY, WARMER_GREY, SUSSOL_ORANGE } from '../globalStyles';

import { navStrings } from '../localization';

export class Vm extends React.Component {
  constructor(props) {
    super(props);
    this.databaseListenerId = null;
    this.state = {};
  }

  componentWillMount() {
    this.databaseListenerId = this.props.database.addListener(
      // Ensure that language changes in login modal are re-rendered onto the Vm
      (changeType, recordType) => recordType === 'Setting' && this.forceUpdate(),
    );
  }

  componentWillReceiveProps() {
    this.refreshData();
  }

  componentWillUnmount() {
    this.props.database.removeListener(this.databaseListenerId);
  }

  refreshData = () => {
    this.setState({
      customerRequsitionNotFinalized: this.props.database
        .objects('ResponseRequisition')
        .filtered('status != "finalised"').length,
      supplierRequsitionNotFinalized: this.props.database
        .objects('RequestRequisition')
        .filtered('status != "finalised"').length,
      supplierInvoiceNotFinalized: this.props.database
        .objects('SupplierInvoice')
        .filtered('status != "finalised"').length,
      stocktakesNotFinalized: this.props.database
        .objects('Stocktake')
        .filtered('status != "finalised"').length,
    });
  };

  exportData = () => {
    const { settings, database } = this.props;
    const syncSiteName = settings.get(SYNC_SITE_NAME);
    database.exportData(syncSiteName);
  };

  fridges = () =>
    this.props.database.objects('Location').map(fridge => {
      console.log('yow');
      const data = [
        { x: '23-01 8am', y: 6 },
        { x: '23-01 8pm', y: 7 },
        { x: '24-01 8am', y: 5 },
        { x: '24-01 8pm', y: 8 },
        { x: '25-01 8am', y: 9 },
        { x: '25-01 8pm', y: 5 },
        { x: '26-01 8am', y: 5.5 },
        { x: '26-01 8pm', y: 4.5 },
        { x: '27-01 8am', y: 6 },
        { x: '27-01 8pm', y: 7 },
        { x: '28-01 8am', y: 5.5 },
        { x: '28-01 8pm', y: 4.5 },
        { x: '29-01 8am', y: 5 },
        { x: '29-01 8pm', y: 5.5 },
      ];
      // backgroundColor: 'rgb(33, 157, 27)'
      return (
        <View
          style={{
            flexDirection: 'column',
            padding: 0,
            margin: 5,
            width: 'auto',
            height: 'auto',
            ...globalStyles.appBackground,
            flexGrow: 1,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            alignContent: 'stretch',
            borderColor: SHADOW_BORDER,
            borderWidth: 1,
          }}
        >
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ ...globalStyles.memenuButtonText, fontSize: 18, color: SUSSOL_ORANGE }}>{fridge.name}</Text>
          </View>
          <View style={{ flexGrow: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch', alignContent: 'stretch' }}>
              <View style={{ flex: 1, borderRadius: 4, margin: 3, alignItems: 'center', alignContent: 'center', justifyContent: 'center', borderWidth: 0, flexGrow: 1, backgroundColor: 'rgb(103, 172, 91)' }}>
                <Text style={{ ...globalStyles.memenuButtonText, fontSize: 30, color: 'white' }}>
                  {'5.0' + '°'}
                </Text>
              </View>
              <View style={{ flex: 1, borderRadius: 4, margin: 3, borderWidth: 1, borderColor: 'rgb(103, 172, 91)', flexGrow: 1, alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgb(103, 172, 91)' }}>Stock Value</Text>
                <Text style={{ color: 'rgb(103, 172, 91)' }}>$200</Text>
              </View>
            </View>
            <View style={{ flex: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch', alignContent: 'stretch' }}>
              <View style={{ width: '90%', height: '90%' }}>
                <ReportChart
                  minTemp={3}
                  maxTemp={7.5}
                  data={data}
                />
              </View>
            </View>
          </View>
        </View>
      );
    });

    

  render() {
    const { logOut, navigateTo } = this.props;
    return (
      <View style={[globalStyles.pageContentContainer, localStyles.pageContentContainer]}>
        <View style={[globalStyles.horizontalContainer, localStyles.horizontalContainer]}>
          <View style={{ ...localStyles.container, flex: 1 }}>
            <Image
              style={localStyles.image}
              resizeMode="contain"
              source={require('../images/menu_vaccine.png')}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={'Give Vaccine'}
              onPress={() => navigateTo('customerInvoices', navStrings.customer_invoices)}
            />

            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={'Order Vaccine'}
              onPress={() => navigateTo('requestRequisition', navStrings.request_requisition)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={'Manage Stock'}
              onPress={() => navigateTo('stock', navStrings.current_stock)}
            />
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text={'Extras'}
              onPress={() => navigateTo('vaccineModule', 'VaccindeModule Strea')}
            />
          </View>

          <View
            style={{
              ...localStyles.container,
              ...localStyles.centralContainer,
              flex: 2,
              justifyContent: 'center',
              alignItems: 'stretch',
              paddingVertical: 0,
              paddingHorizontal: 0,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Image
                style={{ ...localStyles.image, height: 75, width: 75 }}
                resizeMode="contain"
                source={require('../images/menu_fridge.png')}
              />
            </View>
            {this.fridges()}
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

Vm.propTypes = {
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
    marginLeft: 40,
  },
  image: {
    height: 100,
    width: 100,
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
