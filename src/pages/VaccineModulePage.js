/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types, global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, StyleSheet, View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';

import { VaccineChart, BreachTable, PageContentModal } from '../widgets';
import { extractDataForFridgeChart } from '../utilities/modules/vaccines/chartHelpers';

import { navStrings } from '../localization';
import globalStyles, {
  SHADOW_BORDER,
  APP_FONT_FAMILY,
  SUSSOL_ORANGE,
  GREY,
  HAZARD_RED,
} from '../globalStyles';

const LOCALIZATION = {
  misc: {
    emptyFridge: 'Empty Fridge',
    breaches: 'Breaches',
    totalStock: 'Total Stock',
    noFridges: 'NO CONFIGURED FRIDGES',
  },
  modal: {
    breachTitle: 'Temperature breach for ',
  },
  menuButtons: {
    customerInvoice: 'Customer Invoice',
    supplierInvoice: 'Supplier Invoice',
    orderStock: 'Order Stock',
    manageStock: 'Manage Stock',
  },
  navigation: {
    manageVaccineStock: 'Manage Vaccine Stock',
  },
};

const CHEVRON_ICON_STYLE = { size: 18, color: SUSSOL_ORANGE };
const BREACH_ICON_STYLE = { size: 25, color: HAZARD_RED };
const getMenuButtons = () => [
  {
    page: 'manageVaccineStock',
    pageTitle: LOCALIZATION.navigation.manageVaccineStock,
    buttonText: LOCALIZATION.menuButtons.manageStock,
  },
  {
    page: 'supplierInvoices',
    pageTitle: navStrings.supplier_invoices,
    buttonText: navStrings.supplier_invoices,
  },
  {
    page: 'customerInvoices',
    pageTitle: navStrings.customer_invoices,
    buttonText: navStrings.customer_invoices,
  },
  {
    page: 'supplierRequisitions',
    pageTitle: 'Order Stock',
    buttonText: LOCALIZATION.menuButtons.orderStock,
  },
];

export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);

    // { fridgeID: { extractDataForFridgeChart() }, ... }
    this.FRIDGE_DATA = {};
    this.HAS_FRIDGES = false;
    this.FRIDGES = null;
    this.MENU_BUTTONS = getMenuButtons();
    this.state = { selectedFridge: null, currentBreach: null, isModalOpen: false };
  }

  componentWillMount = async () => {
    const { database, runWithLoadingIndicator } = this.props;
    this.FRIDGES = database.objects('Fridge');
    this.HAS_FRIDGES = this.FRIDGES.length > 0;
    const selectedFridge = this.HAS_FRIDGES ? this.FRIDGES[0] : null;

    await runWithLoadingIndicator(() => {
      this.FRIDGES.forEach(fridge => {
        const dataForFridgeChart = extractDataForFridgeChart({ database, fridge });
        this.FRIDGE_DATA[fridge.id] = dataForFridgeChart;
      });
    });

    this.setState({ selectedFridge });
  };

  onModalUpdate = () => {
    const { isModalOpen } = this.state;
    this.setState({ isModalOpen: !isModalOpen });
  };

  getModalTitle = () => {
    const { selectedFridge } = this.state;
    return `${LOCALIZATION.modal.breachTitle} ${selectedFridge.description}`;
  };

  /* Helper to render menuButton */
  renderMenuButton = buttonProps => (
    <Button
      style={[globalStyles.menuButton, localStyles.menuButton]}
      textStyle={globalStyles.menuButtonText}
      {...buttonProps}
    />
  );

  renderIcon = (iconName, iconStyle = CHEVRON_ICON_STYLE, onPress = () => {}) => (
    <Icon style={{ margin: 5 }} name={iconName} {...iconStyle} onPress={onPress} />
  );

  /* Render fridge name and chevron-down icon if icon not selected fridge */
  renderFridgeName = (fridge, isFridgeSelected) => {
    const onPress = () => this.setState({ selectedFridge: fridge });
    const { fridgeInfoSectionStyle, fridgeNameTextStyle } = localStyles;
    return (
      <TouchableOpacity style={fridgeInfoSectionStyle} onPress={onPress}>
        {!isFridgeSelected && this.renderIcon('chevron-down')}
        <Text style={fridgeNameTextStyle}>{fridge.description}</Text>
      </TouchableOpacity>
    );
  };

  /* Temperature with celcius symbol based on passed fontSize */
  renderTemperature = (fontSize, temperature) => {
    const { greyTextStyleLarge } = localStyles;
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={[greyTextStyleLarge, { fontSize }]}>{temperature}</Text>
        <Text style={[greyTextStyleLarge, { fontSize: fontSize * 0.7 }]}>℃</Text>
      </View>
    );
  };

  blinkSensor = async () => {
    const { selectedFridge } = this.state;
    const { database, runWithLoadingIndicator } = this.props;
    const sensor = selectedFridge.getSensor(database);
    if (!sensor) {
      ToastAndroid.show('No sensor attached to this fridge', ToastAndroid.SHORT);
    } else {
      await runWithLoadingIndicator(async () => {
        await sensor.sendBlink();
      }, true);
    }
  };

  /* Render 'Breach: {num} Exposure: {fromTemp} to {toTemp} */
  renderFridgeExtraInfo = (fridge, numberOfBreaches) => {
    const { database } = this.props;

    const { minTemperature, maxTemperature } = fridge.getTemperatureExposure(database);

    if (!minTemperature || !maxTemperature) return null;
    const hasBreaches = numberOfBreaches > 0;

    const {
      extraInfoSectionStyle,
      greyTextStyleSmall,
      greyTextStyleLarge,
      fridgeInfoSectionStyle,
    } = localStyles;

    return (
      <View style={[fridgeInfoSectionStyle, extraInfoSectionStyle]}>
        {hasBreaches && (
          <View style={[fridgeInfoSectionStyle, { marginRight: 10 }]}>
            <Text style={greyTextStyleSmall}>{`${LOCALIZATION.misc.breaches}:`}</Text>
            <Text style={greyTextStyleLarge}>{numberOfBreaches}</Text>
          </View>
        )}
        <TouchableOpacity onPress={this.blinkSensor}>
          <Icon name="lightbulb-o" size={30} />
        </TouchableOpacity>
        <Text style={greyTextStyleSmall}>Exposure:</Text>
        {this.renderTemperature(20, minTemperature)}
        <Text style={greyTextStyleSmall}>to</Text>
        {this.renderTemperature(20, maxTemperature)}
      </View>
    );
  };

  /* Render Totaal Stock: {num} */
  renderFridgeStock = fridge => {
    const { navigateTo, database } = this.props;
    const fridgeStock = fridge.getTotalStock(database);
    const hasStock = fridgeStock > 0;

    const onPress = () =>
      navigateTo('manageVaccineStock', 'Manage Vaccine Stock', {
        initialLocation: fridge,
      });

    const { fridgeInfoSectionStyle, greyTextStyleLarge, greyTextStyleSmall } = localStyles;
    const fontStyleLarge = { ...greyTextStyleLarge, color: SUSSOL_ORANGE };
    const fontStyleSmall = { ...greyTextStyleSmall, color: SUSSOL_ORANGE };

    if (!hasStock) return <Text style={fontStyleSmall}>{LOCALIZATION.misc.emptyFridge}</Text>;
    return (
      <TouchableOpacity style={fridgeInfoSectionStyle} onPress={onPress}>
        <Text style={fontStyleSmall}>{`${LOCALIZATION.misc.totalStock}:`}</Text>
        <Text style={fontStyleLarge}>{fridgeStock}</Text>
        {this.renderIcon('angle-double-right', CHEVRON_ICON_STYLE)}
      </TouchableOpacity>
    );
  };

  onHazardPress = ({ sensorLogs }) => {
    this.setState({ currentBreach: [sensorLogs], isModalOpen: true });
  };

  /* Fridge and all of it's components */
  renderFridge = fridge => {
    const { database } = this.props;
    const fridgeChartData = this.FRIDGE_DATA[fridge.id];
    if (!fridgeChartData) return null;
    const numberOfBreaches = fridgeChartData.breaches.length;
    let lastBreach = null;
    if (numberOfBreaches > 0) {
      lastBreach = fridgeChartData.breaches[numberOfBreaches - 1];
    }

    const currentTemperature = fridge.getCurrentTemperature(database);
    const isInBreach = currentTemperature !== null && fridge.isInBreach(database);

    const { selectedFridge } = this.state;
    const isFridgeSelected = fridge.id === selectedFridge.id;

    const { sectionStyle, fridgeInfoSectionStyle } = localStyles;
    return (
      <View key={fridge.id}>
        <View style={[sectionStyle, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <View style={fridgeInfoSectionStyle}>
            {this.renderFridgeName(fridge, isFridgeSelected)}
            {currentTemperature !== null ? this.renderTemperature(30, currentTemperature) : null}

            {isInBreach
              ? this.renderIcon('warning', BREACH_ICON_STYLE, () => this.onHazardPress(lastBreach))
              : null}
            <View style={[fridgeInfoSectionStyle, { justifyContent: 'flex-end', flexGrow: 1 }]}>
              {this.renderFridgeExtraInfo(fridge, numberOfBreaches)}
              {this.renderFridgeStock(fridge)}
            </View>
          </View>
          {isFridgeSelected && (
            <View style={{ height: 250, alignSelf: 'stretch' }}>
              {<VaccineChart {...fridgeChartData} onHazardPress={this.onHazardPress} />}
            </View>
          )}
        </View>
      </View>
    );
  };

  renderMenuButtons = () => {
    const { menuButtonTextStyle, menuButtonStyle } = localStyles;
    const { navigateTo } = this.props;
    return this.MENU_BUTTONS.map(menuButton => {
      const { buttonText, pageTitle, page } = menuButton;
      return (
        <Button
          key={buttonText}
          style={menuButtonStyle}
          textStyle={menuButtonTextStyle}
          text={buttonText}
          onPress={() => navigateTo(page, pageTitle)}
        />
      );
    });
  };

  render() {
    const { FRIDGES, HAS_FRIDGES } = this;
    const { navigateTo, isInAdminMode } = this.props;
    const { isModalOpen, currentBreach, selectedFridge } = this.state;
    const { pageContainerStyle, sectionStyle, imageStyle, greyTextStyleLarge } = localStyles;

    if (!selectedFridge) return null;
    return (
      <View style={pageContainerStyle}>
        <View style={sectionStyle}>
          <Image
            style={imageStyle}
            resizeMode="contain"
            source={require('../images/menu_vaccines.png')}
          />
          {this.renderMenuButtons()}
        </View>
        {HAS_FRIDGES && FRIDGES.map(this.renderFridge)}
        {HAS_FRIDGES === false ? (
          <Text style={[greyTextStyleLarge]}>{LOCALIZATION.misc.noFridges}</Text>
        ) : null}
        {isInAdminMode ? (
          <Button
            key="VM Admin"
            style={localStyles.menuButtonStyle}
            textStyle={localStyles.menuButtonTextStyle}
            text="VM Admin"
            onPress={() => navigateTo('vaccineModuleAdminPage', 'Vaccine Module Admin')}
          />
        ) : null}
        {isModalOpen && (
          <PageContentModal
            isOpen={isModalOpen}
            onClose={this.onModalUpdate}
            title={this.getModalTitle()}
          >
            <BreachTable {...this.props} breaches={currentBreach} />
          </PageContentModal>
        )}
      </View>
    );
  }
}

export default VaccineModulePage;

VaccineModulePage.propTypes = {
  database: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
  genericTablePageStyles: PropTypes.object.isRequired,
  isInAdminMode: PropTypes.object,
  runWithLoadingIndicator: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  pageContainerStyle: {
    ...globalStyles.pageContentContainer,
    padding: 10,
  },
  menuButtonStyle: {
    ...globalStyles.menuButton,
    width: 170,
    padding: 10,
  },
  menuButtonTextStyle: {
    ...globalStyles.menuButtonText,
    fontSize: 15,
  },
  sectionStyle: {
    margin: 5,
    padding: 10,
    paddingRight: 15,
    flexDirection: 'row',
    borderColor: SHADOW_BORDER,
    borderWidth: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  extraInfoSectionStyle: {
    flexDirection: 'row',
    marginRight: 10,
  },
  imageStyle: {
    height: 60,
    width: 60,
    marginLeft: 20,
    marginRight: 20,
  },
  fridgeInfoSectionStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fridgeNameTextStyle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 20,
    color: SUSSOL_ORANGE,
    marginRight: 15,
    marginLeft: 5,
  },
  greyTextStyleLarge: {
    fontFamily: APP_FONT_FAMILY,
    fontWeight: '400',
    color: GREY,
    fontSize: 22,
  },
  greyTextStyleSmall: {
    fontFamily: APP_FONT_FAMILY,
    fontWeight: '400',
    color: GREY,
    alignSelf: 'flex-end',
    margin: 7,
    fontSize: 15,
  },
});
