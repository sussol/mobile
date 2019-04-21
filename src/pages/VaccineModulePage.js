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
import { VaccineChart } from '../widgets/VaccineChart';
import globalStyles, {
  SHADOW_BORDER,
  APP_FONT_FAMILY,
  SUSSOL_ORANGE,
  GREY,
  HAZARD_RED,
} from '../globalStyles';

import { extractDataForFridgeChart } from '../utilities/modules/vaccines';

const CHERVON_ICON_STYLE = { size: 18, color: SUSSOL_ORANGE };
const BREACH_ICON_STYLE = { size: 25, color: HAZARD_RED };

// TODO navigation for menu buttons
// TODO Localise all strings

export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fridges: [], selectedFridgeCode: null };
  }

  componentWillMount() {
    const { database } = this.props;
    const fridges = database.objects('Location').filter(({ isFridge }) => isFridge);
    const selectedFridgeCode = fridges.length > 0 && fridges[0].code;
    this.setState({ fridges, selectedFridgeCode });
  }

  /* Helper to render menuButton */
  renderMenuButton = buttonProps => (
    <Button
      style={[globalStyles.menuButton, localStyles.menuButton]}
      textStyle={globalStyles.menuButtonText}
      {...buttonProps}
    />
  );

  renderIcon = (iconName, iconStyle = CHERVON_ICON_STYLE) => (
    <Icon style={{ margin: 5 }} name={iconName} {...iconStyle} />
  );

  /* Render fridge name and chevron-down icon if icon not selected fridge */
  renderFridgeName = (fridge, isFridgeSNotelected) => {
    const onPress = () => this.setState({ selectedFridgeCode: fridge.code });

    const { fridgeInfoSectionStyle, fridgeNameTextStyle } = localStyles;

    return (
      <TouchableOpacity style={fridgeInfoSectionStyle} onPress={onPress}>
        {!isFridgeSNotelected && this.renderIcon('chevron-down')}
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
    const hasBreaches = numberOfBreaches > 0;
    const { minTemperature, maxTemperature } = fridge.getTemperatureExposure();

    const { greyTextStyleSmall, greyTextStyleLarge, fridgeInfoSectionStyle } = localStyles;
    const extraSectionStyle = { flexDirection: 'row', justifySelf: 'flex-end', marginRight: 10 };

    return (
      <View style={[fridgeInfoSectionStyle, extraSectionStyle]}>
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
    const fridgeStock = fridge.getTotalStock();
    const hasStock = fridgeStock > 0;
    const { navigateTo } = this.props;

    const onPress = () =>
      navigateTo('manageVaccineItems', 'Manage Vaccine Items', {
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
        {this.renderIcon('angle-double-right', CHERVON_ICON_STYLE)}
      </TouchableOpacity>
    );
  };

  onHazardPress = breach => {
    console.log(breach.temperature);
    // const breaches = [breach.sensorLogs];
    // open modal with params, data: [getDataForBreachModal({ breaches })]
  };

  renderChart = fridge => <VaccineChart {...this.extractChartInfo(fridge)} />;

  /* Fridge and all of it's components */
  renderFridge = fridge => {
    const { database } = this.props;
    const fridgeChartData = extractDataForFridgeChart({ database, fridge });

    const { sectionStyle, fridgeInfoSectionStyle } = localStyles;
    const { selectedFridgeCode } = this.state;
    const isFridgeSelected = fridge.code === selectedFridgeCode;

    return (
      <View key={fridge.code}>
        <View style={[sectionStyle, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <View style={fridgeInfoSectionStyle}>
            {this.renderFridgeName(fridge, isFridgeSelected)}
            {this.renderTemperature(30, fridge.getCurrentTemperature())}

            {fridge.isInBreach ? this.renderIcon('warning', BREACH_ICON_STYLE) : null}
            <View style={[fridgeInfoSectionStyle, { justifyContent: 'flex-end', flexGrow: 1 }]}>
              {this.renderFridgeExtraInfo(fridge, fridgeChartData.breaches)}
              {this.renderFridgeStock(fridge)}
            </View>
          </View>
          {isFridgeSelected && (
            <View style={{ height: 250, alignSelf: 'stretch' }}>
              {<VaccineChart {...fridgeChartData} hazardPress={this.onHazardPress} />}
            </View>
          )}
        </View>
      </View>
    );
  };

  render() {
    const { fridges } = this.state;
    const { navigateTo } = this.props;

    const menuButtons = [
      { text: 'Customer Invoice', onPress: () => console.log('Customer Invoice') },
      { text: 'Supplier Invoice', onPress: () => console.log('Supplier Invoice') },
      { text: 'Order Stock', onPress: () => console.log('Order Stock') },
      {
        text: 'Manage Stock',
        onPress: () => navigateTo('manageVaccineItems', 'Manage Vaccine Items'),
      },
    ];

    const hasFridges = fridges.length > 0;
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
      </View>
    );
  }
}

export default VaccineModulePage;

VaccineModulePage.propTypes = {
  database: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
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
