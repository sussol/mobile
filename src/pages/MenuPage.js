/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, ToastAndroid } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { Button } from 'react-native-ui-components';
import {
  CustomerImage,
  IconButton,
  SupplierImage,
  StockImage,
  ModulesImage,
  InfoBadge,
} from '../widgets';

import { PowerIcon, CogIcon, HazardIcon } from '../widgets/icons';
import { ROUTES } from '../navigation/constants';
import { buttonStrings, navStrings } from '../localization';

import { selectIsScanning } from '../selectors/vaccine';

import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';

import {
  gotoCustomerInvoices,
  gotoCustomerRequisitions,
  gotoSupplierInvoices,
  gotoSupplierRequisitions,
  gotoStock,
  gotoStocktakes,
  gotoRealmExplorer,
  goToCashRegister,
  gotoDispensingPage,
  gotoSettings,
  gotoDashboard,
  goToVaccines,
} from '../navigation/actions';

import globalStyles, { SHADOW_BORDER } from '../globalStyles';
import { UserActions, VaccineActions } from '../actions/index';
import { selectCurrentUserIsAdmin } from '../selectors/user';

const sensorMacAddress = 'FC:C0:EE:9D:80:A3';
const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const { success, message } = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success ? 'Exported data file' : `Couldn't export data: ${message}`;
  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Menu = ({
  isInAdminMode, // isInAdminMode kept for backwards compatibility with Desktop < v4.07
  logout,
  toVaccines,
  toCustomerInvoices,
  toCustomerRequisitions,
  toStock,
  toStocktakes,
  toSupplierInvoices,
  toSupplierRequisitions,
  toRealmExplorer,
  toDispensary,
  toSettings,
  toDashboard,
  toCashRegister,
  usingDashboard,
  usingDispensary,
  usingCashRegister,
  usingModules,
  usingVaccines,
  isAdmin,
  blink,
  isScanning,
  scanSensorsStart,
  scanSensorsEnd,
}) => {
  const { menuButton, menuButtonText: buttonText, appBackground } = globalStyles;
  const { image, originalContainer, moduleContainer, container, moduleRow } = styles;

  const containerStyle = { ...container, ...(usingModules ? moduleContainer : originalContainer) };

  const isFocused = useIsFocused();

  const scan = () => {
    if (isScanning) {
      scanSensorsEnd();
    } else {
      scanSensorsStart();
    }
  };

  const MenuButton = useCallback(
    props => <Button style={menuButton} textStyle={buttonText} {...props} />,
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const CustomerSection = useCallback(
    () => (
      <View style={containerStyle}>
        <CustomerImage style={image} />
        <View>
          <InfoBadge routeName={ROUTES.CUSTOMER_INVOICES}>
            <MenuButton text={navStrings.customer_invoices} onPress={toCustomerInvoices} />
          </InfoBadge>
          <InfoBadge routeName={ROUTES.CUSTOMER_REQUISITIONS}>
            <MenuButton text={navStrings.customer_requisitions} onPress={toCustomerRequisitions} />
          </InfoBadge>
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const SupplierSection = useCallback(
    () => (
      <View style={containerStyle}>
        <SupplierImage style={image} />
        <View>
          <InfoBadge routeName={ROUTES.SUPPLIER_INVOICES}>
            <MenuButton text={navStrings.supplier_invoices} onPress={toSupplierInvoices} />
          </InfoBadge>
          <InfoBadge routeName={ROUTES.SUPPLIER_REQUISITIONS}>
            <MenuButton text={navStrings.supplier_requisitions} onPress={toSupplierRequisitions} />
          </InfoBadge>
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const StockSection = useCallback(
    () => (
      <View style={containerStyle}>
        <StockImage style={image} />
        <View>
          <MenuButton text={navStrings.current_stock} onPress={toStock} />
          <InfoBadge routeName={ROUTES.STOCKTAKES}>
            <MenuButton text={navStrings.stocktake} onPress={toStocktakes} />
          </InfoBadge>
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const ModulesSection = useCallback(
    () => (
      <View style={containerStyle}>
        <ModulesImage style={image} />
        <View>
          {usingVaccines && <MenuButton text={navStrings.vaccines} onPress={toVaccines} />}
          {usingDispensary && <MenuButton text={navStrings.dispensary} onPress={toDispensary} />}
          {usingDashboard && <MenuButton text={navStrings.dashboard} onPress={toDashboard} />}
          {usingCashRegister && (
            <MenuButton text={navStrings.cash_register} onPress={toCashRegister} />
          )}
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const AdminRow = useCallback(
    () => (
      <View style={styles.bottomRow}>
        <IconButton Icon={<PowerIcon />} label={navStrings.log_out} onPress={logout} />
        <IconButton Icon={<HazardIcon />} label="blink" onPress={blink} />
        <IconButton Icon={<HazardIcon />} label={isScanning ? 'scanning' : 'scan'} onPress={scan} />
        {isInAdminMode && <MenuButton text="Realm Explorer" onPress={toRealmExplorer} />}
        {isInAdminMode && <MenuButton text="Export Data" onPress={exportData} />}
        {isAdmin && (
          <IconButton Icon={<CogIcon />} label={buttonStrings.settings} onPress={toSettings} />
        )}
      </View>
    ),
    [isInAdminMode, isAdmin, isScanning]
  );

  const ModuleLayout = useCallback(
    () => (
      <View style={styles.moduleTopRow}>
        <View style={moduleRow}>
          <CustomerSection />
          <SupplierSection />
        </View>
        <View style={moduleRow}>
          <StockSection />
          <ModulesSection />
        </View>
      </View>
    ),
    [usingModules, usingDashboard, usingDispensary, usingCashRegister]
  );

  const OriginalLayout = useCallback(
    () => (
      <View style={styles.originalTopRow}>
        <CustomerSection />
        <SupplierSection />
        <StockSection />
      </View>
    ),
    [usingModules]
  );

  if (!isFocused) return null;

  return (
    <View style={{ ...appBackground }}>
      {usingModules ? <ModuleLayout /> : <OriginalLayout />}
      <AdminRow />
    </View>
  );
};

const styles = {
  moduleTopRow: { flex: 19 },
  originalTopRow: { flex: 19, flexDirection: 'row' },
  moduleRow: { flex: 1, flexDirection: 'row' },
  image: { height: 150, width: 150, marginBottom: 30 },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  container: {
    alignItems: 'center',
    borderColor: SHADOW_BORDER,
    backgroundColor: 'white',
    marginBottom: 5,
    flex: 1,
    borderWidth: 1,
  },
  moduleContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  originalContainer: {
    justifyContent: 'flex-start',
    paddingTop: 50,
    marginHorizontal: 30,
  },
};

const mapDispatchToProps = dispatch => ({
  toVaccines: () => dispatch(goToVaccines()),
  toCustomerInvoices: () => dispatch(gotoCustomerInvoices()),
  toCustomerRequisitions: () => dispatch(gotoCustomerRequisitions()),
  toStock: () => dispatch(gotoStock()),
  toStocktakes: () => dispatch(gotoStocktakes()),
  toSupplierInvoices: () => dispatch(gotoSupplierInvoices()),
  toSupplierRequisitions: () => dispatch(gotoSupplierRequisitions()),
  toRealmExplorer: () => dispatch(gotoRealmExplorer()),
  toSettings: () => dispatch(gotoSettings()),
  toDispensary: () => dispatch(gotoDispensingPage()),
  toDashboard: () => dispatch(gotoDashboard()),
  toCashRegister: () => dispatch(goToCashRegister()),
  logout: () => dispatch(UserActions.logout()),
  blink: () => dispatch(VaccineActions.blinkSensor(sensorMacAddress)),
  scanSensorsStart: () => dispatch(VaccineActions.startSensorScan()),
  scanSensorsEnd: () => dispatch(VaccineActions.stopSensorScan()),
});

const mapStateToProps = state => {
  const { modules } = state;

  const {
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
  } = modules;

  const isAdmin = selectCurrentUserIsAdmin(state);
  const isScanning = selectIsScanning(state);

  return {
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
    isAdmin,
    isScanning,
  };
};

export const MenuPage = connect(mapStateToProps, mapDispatchToProps)(Menu);

Menu.defaultProps = {
  isInAdminMode: false, // isInAdminMode kept for backwards compatibility with Desktop < v4.07
  isAdmin: false,
};

Menu.propTypes = {
  isInAdminMode: PropTypes.bool,
  blink: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  toVaccines: PropTypes.func.isRequired,
  toCustomerInvoices: PropTypes.func.isRequired,
  toCustomerRequisitions: PropTypes.func.isRequired,
  toStock: PropTypes.func.isRequired,
  toStocktakes: PropTypes.func.isRequired,
  toSupplierInvoices: PropTypes.func.isRequired,
  toSupplierRequisitions: PropTypes.func.isRequired,
  toRealmExplorer: PropTypes.func.isRequired,
  toDispensary: PropTypes.func.isRequired,
  toSettings: PropTypes.func.isRequired,
  toDashboard: PropTypes.func.isRequired,
  toCashRegister: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  usingDispensary: PropTypes.bool.isRequired,
  usingDashboard: PropTypes.bool.isRequired,
  usingCashRegister: PropTypes.bool.isRequired,
  usingModules: PropTypes.bool.isRequired,
  usingVaccines: PropTypes.bool.isRequired,
  isScanning: PropTypes.bool.isRequired,
  scanSensorsStart: PropTypes.func.isRequired,
  scanSensorsEnd: PropTypes.func.isRequired,
};
