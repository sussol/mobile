/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';

import { navStrings } from '../localization';
import { SETTINGS_KEYS } from '../settings';

import globalStyles, { APP_FONT_FAMILY, SHADOW_BORDER, GREY, WARMER_GREY } from '../globalStyles';

/* eslint-disable global-require */

const { SYNC_SITE_NAME, THIS_STORE_CUSTOM_DATA } = SETTINGS_KEYS;

const ORIGINAL_LAYOUT = [['customer', 'supplier', 'stock']];
const VACCINE_MODULE_LAYOUT = [['customer', 'supplier'], ['stock', 'modules']];

const SECTIONS = {
  customer: {
    icon: require('../images/menu_people.png'),
    buttons: [
      { title: navStrings.customer_invoices, page: 'customerInvoices' },
      { title: navStrings.customer_requisitions, page: 'customerRequisitions' },
    ],
  },
  supplier: {
    icon: require('../images/menu_truck.png'),
    buttons: [
      { title: navStrings.supplier_invoices, page: 'supplierInvoices' },
      { title: navStrings.supplier_requisitions, page: 'supplierRequisitions' },
    ],
  },
  stock: {
    icon: require('../images/menu_pc_clipboard.png'),
    buttons: [
      { title: navStrings.current_stock, page: 'stock' },
      { title: navStrings.stocktakes, page: 'stocktakes' },
    ],
  },
  modules: {
    icon: require('../images/menu_modules.png'),
    buttons: [], // buttons will come from mathich MODULES as per below
  },
};

// Below keys are matched against current store customData (stored in settings)
// i.e. customData['usesVaccineModule']data === 'true'
const MODULES = {
  // TODO, change from 'stock' to 'vaccineModule'
  usesVaccineModule: { title: navStrings.vaccine_module, page: 'stock' },
};

export class MenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.databaseListenerId = null;
  }

  componentWillMount() {
    const { database, settings } = this.props;

    this.sections = SECTIONS;
    // check is there are any modules enabled in this store customData
    const usableModules = this.getUsedModules(settings.get(THIS_STORE_CUSTOM_DATA));
    const usesModules = usableModules.length > 0;
    this.sections.modules.buttons = usableModules;

    if (!usesModules) {
      this.layout = ORIGINAL_LAYOUT;
      this.imageStyle = localStyles.originalImage;
      this.sectionStyle = localStyles.section;
    } else {
      this.layout = VACCINE_MODULE_LAYOUT;
      this.imageStyle = localStyles.VM_Image;
      // Image will go on the left side as layout changes when modules are enabled
      this.sectionStyle = { ...localStyles.section, flexDirection: 'row' };
    }

    this.databaseListenerId = database.addListener(
      // Ensure that language changes in login modal are re-rendered onto the MenuPage.
      (_, recordType) => recordType === 'Setting' && this.forceUpdate()
    );
  }

  componentWillUnmount() {
    const { database } = this.props;

    database.removeListener(this.databaseListenerId);
  }

  /**
   * Method will try to match stringified customData object for current store
   * against keys in MODULES, will return values of keys in MODULES
   * that match: customData[keyInModules]data === 'true'
   * @param {string}  customDataAsString  Store custom data as string
   * @return {array}  result              The maxOrdersPerPeriod of the orderType
   */
  getUsedModules = customDataAsString => {
    if (!customDataAsString || customDataAsString.length === 0) return [];

    const customData = JSON.parse(customDataAsString);
    const result = [];
    const checkAndAddToResult = ([moduleName, moduleValues]) => {
      if (!customData[moduleName]) return;
      if (!customData[moduleName].data) return;
      if (customData[moduleName].data === 'true') result.push(moduleValues);
    };

    Object.entries(MODULES).forEach(checkAndAddToResult);

    return result.length > 0 && result;
  };

  exportData = () => {
    const { settings, database } = this.props;
    const syncSiteName = settings.get(SYNC_SITE_NAME);
    database.exportData(syncSiteName);
  };

  renderButton = ({ title, page }) => (
    <Button
      style={globalStyles.menuButton}
      textStyle={globalStyles.menuButtonText}
      text={title}
      // eslint-disable-next-line react/destructuring-assignment
      onPress={() => this.props.navigateTo(page, title)}
    />
  );

  renderSection = sectionName => {
    const { imageStyle, sectionStyle } = this;
    const section = this.sections[sectionName];
    return (
      <View style={sectionStyle}>
        <Image style={imageStyle} resizeMode="contain" source={section.icon} />
        <View>{section.buttons.map(this.renderButton)}</View>
      </View>
    );
  };

  render() {
    const { isInAdminMode, logOut, navigateTo } = this.props;

    return (
      <View style={[globalStyles.pageContentContainer, localStyles.pageContentContainer]}>
        {this.layout.map(row => (
          <View style={[globalStyles.horizontalContainer, localStyles.horizontalContainer]}>
            {row.map(this.renderSection)}
          </View>
        ))}
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
          {isInAdminMode && (
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text="Realm Explorer"
              onPress={() => navigateTo('realmExplorer', 'Database Contents')}
            />
          )}
          {isInAdminMode && (
            <Button
              style={globalStyles.menuButton}
              textStyle={globalStyles.menuButtonText}
              text="Export Data"
              onPress={this.exportData}
            />
          )}
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
  section: {
    alignSelf: 'stretch',
    flex: 1,
    margin: 10,
    borderColor: SHADOW_BORDER,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  originalImage: {
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  VM_Image: {
    height: 120,
    width: 120,
  },
  logOutText: {
    fontFamily: APP_FONT_FAMILY,
    color: WARMER_GREY,
  },
  bottomIcon: {
    color: GREY,
  },
});
