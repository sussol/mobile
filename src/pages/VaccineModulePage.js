/* eslint-disable no-console */
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
import { VaccineChart, BreachTable } from '../widgets';
import {
  extractDataForFridgeChart,
  extractDataForBreachModal,
} from '../utilities/modules/vaccines';

import globalStyles, {
  SHADOW_BORDER,
  APP_FONT_FAMILY,
  SUSSOL_ORANGE,
  GREY,
  HAZARD_RED,
} from '../globalStyles';
import { PageContentModal } from '../widgets/modals/index';

const CHEVRON_ICON_STYLE = { size: 18, color: SUSSOL_ORANGE };
const BREACH_ICON_STYLE = { size: 25, color: HAZARD_RED };

// TODO navigation for menu buttons
// TODO Localise all strings

export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedFridgeId: null, breachData: null, isModalOpen: false };
  }

  componentWillMount() {
    const { database } = this.props;
    const fridges = database.objects('Location').filter(({ isFridge }) => isFridge);
    const hasFridges = fridges.length > 0;
    const selectedFridgeId = hasFridges ? fridges[0].id : null;

    this.fridges = fridges;
    this.hasFridges = hasFridges;
    this.setState({ selectedFridgeId });
  }

  /* Helper to render menuButton */
  renderMenuButton = buttonProps => (
    <Button
      style={[globalStyles.menuButton, localStyles.menuButton]}
      textStyle={globalStyles.menuButtonText}
      {...buttonProps}
    />
  );

  renderIcon = (iconName, iconStyle = CHEVRON_ICON_STYLE) => (
    <Icon style={{ margin: 5 }} name={iconName} {...iconStyle} />
  );

  /* Render fridge name and chevron-down icon if icon not selected fridge */
  renderFridgeName = (fridge, isFridgeSelected) => {
    const onPress = () => this.setState({ selectedFridgeId: fridge.id });

    const { fridgeInfoSectionStyle, fridgeNameTextStyle } = localStyles;

    return (
      <TouchableOpacity style={fridgeInfoSectionStyle} onPress={onPress}>
        {!isFridgeSelected && this.renderIcon('chevron-down')}
        <Text style={fridgeNameTextStyle}>{fridge.description}</Text>
      </TouchableOpacity>
    );
  };

  /* Temperature with celcius symbol based no passed fontSize */
  renderTemperature = (fontSize, temperature) => {
    const { greyTextStyleLarge } = localStyles;
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={[greyTextStyleLarge, { fontSize }]}>{temperature}</Text>
        <Text style={[greyTextStyleLarge, { fontSize: fontSize * 0.7 }]}>℃</Text>
      </View>
    );
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
            <Text style={greyTextStyleSmall}>Breaches:</Text>
            <Text style={greyTextStyleLarge}>{numberOfBreaches}</Text>
          </View>
        )}
        <Text style={greyTextStyleSmall}>Exposure:</Text>
        {this.renderTemperature(20, minTemperature)}
        <Text style={greyTextStyleSmall}>to</Text>
        {this.renderTemperature(20, maxTemperature)}
      </View>
    );
  };

  /* Render 'Breach: {num} Exposure: {fromTemp} to {toTemp} */
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

    if (!hasStock) return <Text style={fontStyleSmall}>Empty Fridge</Text>;
    return (
      <TouchableOpacity style={fridgeInfoSectionStyle} onPress={onPress}>
        <Text style={fontStyleSmall}>Total Stock:</Text>
        <Text style={fontStyleLarge}>{fridgeStock}</Text>
        {this.renderIcon('angle-double-right', CHEVRON_ICON_STYLE)}
      </TouchableOpacity>
    );
  };

  onHazardPress = ({ sensorLogs }) => {
    const { database } = this.props;
    const dataForModal = extractDataForBreachModal({ breaches: [sensorLogs], database });
    this.setState({ breachData: dataForModal, isModalOpen: true });
  };

  renderChart = fridge => <VaccineChart {...this.extractChartInfo(fridge)} />;

  /* Fridge and all of it's components */
  renderFridge = fridge => {
    const { database } = this.props;
    const fridgeChartData = extractDataForFridgeChart({ database, fridge });

    const numberOfBreaches = fridgeChartData.breaches.length;

    const currentTemperature = fridge.getCurrentTemperature(database);
    const isCriticalTemperature =
      currentTemperature !== null && fridge.isCriticalTemperature(database);

    const { selectedFridgeId } = this.state;
    const isFridgeSelected = fridge.id === selectedFridgeId;

    const { sectionStyle, fridgeInfoSectionStyle } = localStyles;
    return (
      <View key={fridge.id}>
        <View style={[sectionStyle, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <View style={fridgeInfoSectionStyle}>
            {this.renderFridgeName(fridge, isFridgeSelected)}
            {currentTemperature !== null ? this.renderTemperature(30, currentTemperature) : null}

            {isCriticalTemperature ? this.renderIcon('warning', BREACH_ICON_STYLE) : null}
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

  render() {
    const { fridges, hasFridges } = this;
    const { navigateTo, genericTablePageStyles, database } = this.props;
    const { isModalOpen, breachData } = this.state;
    const menuButtons = [
      { text: 'Customer Invoice', onPress: () => console.log('Customer Invoice') },
      { text: 'Supplier Invoice', onPress: () => console.log('Supplier Invoice') },
      { text: 'Order Stock', onPress: () => console.log('Order Stock') },
      {
        text: 'Manage Stock',
        onPress: () => navigateTo('manageVaccineStock', 'Manage Vaccine Stock'),
      },
    ];

    const {
      pageContainerStyle,
      sectionStyle,
      imageStyle,
      menuButtonStyle,
      greyTextStyleLarge,
      menuButtonTextStyle,
    } = localStyles;

    return (
      <View style={pageContainerStyle}>
        <View style={sectionStyle}>
          <Image
            style={imageStyle}
            resizeMode="contain"
            source={require('../images/menu_vaccines.png')}
          />
          {menuButtons.map(props => (
            <Button style={menuButtonStyle} textStyle={menuButtonTextStyle} {...props} />
          ))}
        </View>
        {hasFridges && fridges.map(this.renderFridge)}
        {!hasFridges && <Text style={[greyTextStyleLarge]}>NO CONFIGURED FRIDGES</Text>}
        {isModalOpen && (
          <PageContentModal isOpen={isModalOpen}>
            <BreachTable
              data={breachData}
              genericTablePageStyles={genericTablePageStyles}
              database={database}
            />
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
