/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Text, View, ToastAndroid } from 'react-native';

import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CustomerImage, SupplierImage, StockImage, ModulesImage, InfoBadge } from '../widgets';

import { ROUTES } from '../navigation/constants';
import { navStrings } from '../localization';

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
} from '../navigation/actions';

import globalStyles, { SHADOW_BORDER, GREY } from '../globalStyles';

const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const { success, message } = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success ? 'Exported data file' : `Couldn't export data: ${message}`;
  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Menu = ({
  isInAdminMode,
  logOut,
  toCustomerInvoices,
  toCustomerRequisitions,
  toStock,
  toStocktakes,
  toSupplierInvoices,
  toSupplierRequisitions,
  toRealmExplorer,
  usingDispensary,
  usingModules,
}) => {
  const { menuButton, menuButtonText: buttonText, appBackground } = globalStyles;
  const { image, originalContainer, moduleContainer, container, bottomIcon, moduleRow } = styles;

  const containerStyle = { ...container, ...(usingModules ? moduleContainer : originalContainer) };

  const MenuButton = useCallback(
    props => <Button style={menuButton} textStyle={buttonText} {...props} />,
    [usingDispensary, usingModules]
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
    [usingDispensary, usingModules]
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
    [usingDispensary, usingModules]
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
    [usingDispensary, usingModules]
  );

  const ModulesSection = useCallback(
    () => (
      <View style={containerStyle}>
        <ModulesImage style={image} />
        <View>{usingDispensary && <MenuButton text="Dispensary" />}</View>
      </View>
    ),
    [usingDispensary, usingModules]
  );

  const AdminRow = useCallback(
    () => (
      <View style={styles.bottomRow}>
        <View style={styles.bottomIconView}>
          <Icon.Button
            name="power-off"
            iconStyle={bottomIcon}
            backgroundColor="rgba(255,255,255,0)"
            onPress={logOut}
          >
            <Text>{navStrings.log_out}</Text>
          </Icon.Button>
        </View>
        {isInAdminMode && <MenuButton text="Realm Explorer" onPress={toRealmExplorer} />}
        {isInAdminMode && <MenuButton text="Export Data" onPress={exportData} />}
      </View>
    ),
    [usingDispensary, usingModules]
  );

  const ModuleLayout = useCallback(() => (
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
  ));

  const OriginalLayout = useCallback(() => (
    <View style={styles.originalTopRow}>
      <CustomerSection />
      <SupplierSection />
      <StockSection />
    </View>
  ));

  return (
    <View style={{ ...appBackground }}>
      {usingModules ? <ModuleLayout /> : <OriginalLayout />}
      <AdminRow />
    </View>
  );
};

const styles = {
  moduleTopRow: { flex: 9 },
  originalTopRow: { flex: 9, flexDirection: 'row' },
  moduleRow: { flex: 1, flexDirection: 'row' },
  image: { height: 150, width: 150, marginBottom: 30 },
  bottomIcon: { color: GREY },
  bottomIconView: { flexGrow: 1, marginLeft: 100 },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  container: {
    alignItems: 'center',
    borderColor: SHADOW_BORDER,
    backgroundColor: 'white',
    marginTop: 30,
    flex: 1,
    borderWidth: 1,
  },
  moduleContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 15,
  },
  originalContainer: {
    justifyContent: 'flex-start',
    paddingTop: 50,
    marginHorizontal: 30,
  },
};

const actionCreators = {
  toCustomerInvoices: gotoCustomerInvoices,
  toCustomerRequisitions: gotoCustomerRequisitions,
  toStock: gotoStock,
  toStocktakes: gotoStocktakes,
  toSupplierInvoices: gotoSupplierInvoices,
  toSupplierRequisitions: gotoSupplierRequisitions,
  toRealmExplorer: gotoRealmExplorer,
};

const mapStateToProps = state => {
  const { modules } = state;

  const { usingDispensary, usingModules, usingVaccines } = modules;
  console.log('***************-------******************');
  console.log(modules);
  console.log('map state', { usingDispensary, usingVaccines, usingModules });
  console.log('*********************************');
  return { usingDispensary, usingVaccines, usingModules };
};

export const MenuPage = connect(
  mapStateToProps,
  actionCreators
)(Menu);

Menu.defaultProps = {
  isInAdminMode: false,
};

Menu.propTypes = {
  isInAdminMode: PropTypes.bool,
  logOut: PropTypes.func.isRequired,
  toCustomerInvoices: PropTypes.func.isRequired,
  toCustomerRequisitions: PropTypes.func.isRequired,
  toStock: PropTypes.func.isRequired,
  toStocktakes: PropTypes.func.isRequired,
  toSupplierInvoices: PropTypes.func.isRequired,
  toSupplierRequisitions: PropTypes.func.isRequired,
  toRealmExplorer: PropTypes.func.isRequired,
  usingDispensary: PropTypes.bool.isRequired,
  usingModules: PropTypes.bool.isRequired,
};
