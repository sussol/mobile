/* eslint-disable react/forbid-prop-types, global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';

import { VaccineChart, BreachTable, PageContentModal } from '../widgets';
import { extractDataForFridgeChart } from '../utilities/modules/vaccines';

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
    exposure: 'Exposure',
    to: 'to',
    noRecordedTemperatures: 'No recorded temperatures',
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

const MENU_BUTTONS = [
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
    pageTitle: navStrings.supplier_requisitions,
    buttonText: LOCALIZATION.menuButtons.orderStock,
  },
];

const SimpleText = props => <Text numberOfLines={1} ellipsizeMode="tail" {...props} />;

const CHEVRON_ICON_STYLE = { size: 25, color: SUSSOL_ORANGE };
const BREACH_ICON_STYLE = { size: 25, color: HAZARD_RED };

export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedFridge: null, currentBreach: null, isModalOpen: false };
  }

  componentWillMount() {
    const { database } = this.props;
    const fridges = database.objects('Location').filter(({ isFridge }) => isFridge);
    const hasFridges = fridges.length > 0;
    const selectedFridge = hasFridges ? fridges[0] : null;

    this.fridges = fridges;
    this.hasFridges = hasFridges;
    this.setState({ selectedFridge });
  }

  onModalUpdate = () => {
    const { isModalOpen } = this.state;
    this.setState({ isModalOpen: !isModalOpen });
  };

  getModalTitle = () => {
    const { selectedFridge } = this.state;
    return `${LOCALIZATION.modal.breachTitle} ${selectedFridge.description}`;
  };

  renderIcon = (iconName, iconStyle = CHEVRON_ICON_STYLE) => (
    <Icon style={{ margin: 5 }} name={iconName} {...iconStyle} />
  );

  onHazardPress = ({ sensorLogs }) => {
    this.setState({ currentBreach: [sensorLogs], isModalOpen: true });
  };

  renderTemp = ({ fontSize, temperature, secondaryTemperature }) => {
    const { greyTextStyleLarge, greyTextStyleSmall } = localStyles;
    const to = <SimpleText style={greyTextStyleSmall}>{LOCALIZATION.misc.to}</SimpleText>;
    const container = children => <View style={{ flexDirection: 'row' }}>{children}</View>;
    const oneTemp = temp => (
      <>
        <SimpleText style={{ ...greyTextStyleLarge, fontSize }}>{temp}</SimpleText>
        <SimpleText style={{ ...greyTextStyleLarge, fontSize: fontSize * 0.7 }}>℃</SimpleText>
      </>
    );
    if (!secondaryTemperature) return container(oneTemp(temperature));
    return container([oneTemp(temperature), to, oneTemp(secondaryTemperature)]);
  };

  renderFridgeStock = ({ fridge }) => {
    const { greyTextStyleLarge, greyTextStyleSmall, fridgeInfoContainer } = localStyles;
    const { navigateTo, database } = this.props;
    const fridgeStock = fridge.getTotalStock(database);
    const hasStock = fridgeStock > 0;
    const smallTextStyle = { ...greyTextStyleSmall, color: SUSSOL_ORANGE };
    const largeTextStyle = { ...greyTextStyleLarge, color: SUSSOL_ORANGE };
    const onPress = () =>
      navigateTo('manageVaccineStock', 'Manage Vaccine Stock', { initialLocation: fridge });

    if (!hasStock) {
      return (
        <SimpleText style={{ ...smallTextStyle, alignSelf: 'center' }}>
          {LOCALIZATION.misc.emptyFridge}
        </SimpleText>
      );
    }

    return (
      <TouchableOpacity style={{ ...fridgeInfoContainer, width: '25%' }} onPress={onPress}>
        <SimpleText style={smallTextStyle}>{`${LOCALIZATION.misc.totalStock}:`}</SimpleText>
        <SimpleText style={{ width: '30%', ...largeTextStyle }}>{fridgeStock}</SimpleText>
        <View style={{ width: '20%' }}>
          {this.renderIcon('angle-double-right', CHEVRON_ICON_STYLE)}
        </View>
      </TouchableOpacity>
    );
  };

  renderTemperatureExposure = ({
    minTemperature: temperature,
    maxTemperature: secondaryTemperature,
  }) => {
    const { greyTextStyleSmall, fridgeInfoContainer } = localStyles;
    return (
      <View style={fridgeInfoContainer}>
        <SimpleText style={greyTextStyleSmall}>{`${LOCALIZATION.misc.exposure}:`}</SimpleText>
        <View style={{ width: '40%' }}>
          {this.renderTemp({ temperature, secondaryTemperature, fontSize: 20 })}
        </View>
      </View>
    );
  };

  renderNumberOfBreaches = ({ numBreaches }) => {
    const { greyTextStyleSmall, greyTextStyleLarge, fridgeInfoContainer } = localStyles;
    return (
      <View style={{ ...fridgeInfoContainer, width: '15%' }}>
        <SimpleText style={greyTextStyleSmall}>{`${LOCALIZATION.misc.breaches}:`}</SimpleText>
        <SimpleText style={{ ...greyTextStyleLarge, width: '50%' }}>{numBreaches}</SimpleText>
      </View>
    );
  };

  renderFridgeName = ({ fridge, currentTemp, isFridgeSelected, isCriticalTemperature }) => {
    const { fridgeNameTextStyle, fridgeInfoContainer } = localStyles;
    const onPress = () => {
      this.setState({ selectedFridge: fridge });
    };
    return (
      <TouchableOpacity style={fridgeInfoContainer} onPress={onPress}>
        <View style={{ width: '10%', bottom: 2 }}>
          {!isFridgeSelected && this.renderIcon('chevron-down')}
        </View>

        <View style={{ width: '60%' }}>
          <SimpleText style={fridgeNameTextStyle}>{fridge.description}</SimpleText>
        </View>

        <View style={{ width: '20%' }}>
          {this.renderTemp({ fontSize: 26, temperature: currentTemp })}
        </View>

        {isCriticalTemperature ? this.renderIcon('warning', BREACH_ICON_STYLE) : null}
      </TouchableOpacity>
    );
  };

  renderFridgeInfoBar = props => {
    const { fridgeExtraInfoContainer } = localStyles;
    const { numBreaches, minTemperature, maxTemperature } = props;
    const renderNumBreaches = numBreaches ? true : null;
    const renderExposure = minTemperature && maxTemperature !== null ? true : null;
    return (
      <View style={{ flexDirection: 'row' }}>
        {this.renderFridgeName(props)}
        <View style={fridgeExtraInfoContainer}>
          {renderNumBreaches && this.renderNumberOfBreaches({ numBreaches })}
          {renderExposure && this.renderTemperatureExposure({ minTemperature, maxTemperature })}
          {this.renderFridgeStock(props)}
        </View>
      </View>
    );
  };

  renderChart = chartData => {
    const { minLine, maxLine } = chartData;
    const hasSensorLogs = minLine && maxLine;
    return hasSensorLogs ? (
      <VaccineChart {...chartData} onHazardPress={this.onHazardPress} />
    ) : (
      <View style={localStyles.noFridgesContainerStyle}>
        <Text style={localStyles.greyTextStyleLarge}>
          {LOCALIZATION.misc.noRecordedTemperatures}
        </Text>
      </View>
    );
  };

  renderFridge = fridge => {
    const { selectedFridge } = this.state;
    const { database } = this.props;
    const fridgeChartData = extractDataForFridgeChart({ database, fridge });
    const isFridgeSelected = fridge.id === selectedFridge.id;
    return (
      <View style={localStyles.sectionStyle}>
        <View style={{ flexDirection: 'column' }}>
          {this.renderFridgeInfoBar({
            numBreaches: fridgeChartData.breaches.length,
            currentTemp: fridge.getCurrentTemperature(database),
            isCriticalTemperature: fridge.isCriticalTemperature(database),
            isFridgeSelected,
            fridge,
            ...fridge.getTemperatureExposure(database),
          })}
          {isFridgeSelected && (
            <View style={{ height: 250, alignSelf: 'stretch' }}>
              {this.renderChart(fridgeChartData)}
            </View>
          )}
        </View>
      </View>
    );
  };

  renderMenuButtons = () => {
    const { menuButtonTextStyle, menuButtonStyle } = localStyles;
    const { navigateTo } = this.props;
    return MENU_BUTTONS.map(menuButton => {
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
    const { fridges, hasFridges } = this;
    const { isModalOpen, currentBreach } = this.state;
    const { pageContainerStyle, sectionStyle, imageStyle, greyTextStyleLarge } = localStyles;

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
        {hasFridges && fridges.map(this.renderFridge)}
        {!hasFridges && (
          <View style={localStyles.noFridgesContainerStyle}>
            <Text style={greyTextStyleLarge}>{LOCALIZATION.misc.noFridges}</Text>
          </View>
        )}
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
};

const localStyles = StyleSheet.create({
  fridgeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '30%',
    alignItems: 'center',
  },
  fridgeExtraInfoContainer: {
    flexDirection: 'row',
    width: '70%',
    justifyContent: 'flex-end',
  },
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
    width: '100%',
  },
  imageStyle: {
    height: 60,
    width: 60,
    marginLeft: 20,
    marginRight: 20,
  },
  fridgeNameTextStyle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 20,
    color: SUSSOL_ORANGE,
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
    marginHorizontal: 5,
    fontSize: 15,
  },
  noFridgesContainerStyle: {
    ...globalStyles.centeredContent,
    height: '70%',
  },
});
