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
import globalStyles, { SHADOW_BORDER, APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';

/* eslint-disable global-require */

export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fridges: [] };
  }

  componentWillMount() {
    const { database } = this.props;
    const fridges = database.objects('Location').filter(({ isFridge }) => isFridge);
    const selectedFridge = fridges.length > 0 && fridges[0].code;
    this.setState({ fridges, selectedFridge });
  }

  renderButton = buttonProps => (
    <Button
      style={[globalStyles.menuButton, localStyles.menuButton]}
      textStyle={globalStyles.menuButtonText}
      {...buttonProps}
    />
  );

  selectFridge = fridge => {
    this.setState({ selectedFridge: fridge.code });
  };

  renderFridge = fridge => (
    <View key={fridge.code}>
      <View style={[localStyles.section, { flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => this.selectFridge(fridge)}>
            <View style={{ margin: 5, alignSelf: 'flex-end', flexDirection: 'row' }}>
              {this.state.selectedFridge !== fridge.code && (
                <Icon
                  style={{ margin: 3, marginRight: 6 }}
                  name="chevron-down"
                  size={15}
                  color={SUSSOL_ORANGE}
                />
              )}
              <Text style={{ fontFamily: APP_FONT_FAMILY, fontSize: 20, color: SUSSOL_ORANGE }}>
                {fridge.description}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ marginLeft: 5, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 30,
                fontWeight: '400',
                color: '#909192',
              }}
            >
              {fridge.getCurrentTemperature()}
            </Text>
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 20,
                marginTop: 2,
                fontWeight: '300',
                color: '#909192',
              }}
            >
              ℃
            </Text>
          </View>
          {fridge.isInBreach ? (
            <Icon style={{ margin: 3, marginLeft: 6 }} name="warning" size={20} color="#e95c30" />
          ) : null}
          <View
            style={{
              marginLeft: 5,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            {fridge.getNumberOfBreaches() > 0 ? (
              <Text
                style={{
                  fontFamily: APP_FONT_FAMILY,
                  fontSize: 15,
                  fontWeight: '400',
                  color: '#909192',
                }}
              >
                Breaches:{' '}
              </Text>
            ) : null}
            {fridge.getNumberOfBreaches() > 0 ? (
              <Text
                style={{
                  fontFamily: APP_FONT_FAMILY,
                  fontSize: 20,
                  fontWeight: '300',
                  color: '#909192',
                }}
              >
                {fridge.getNumberOfBreaches()}
              </Text>
            ) : null}
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 15,
                fontWeight: '400',
                color: '#909192',
                marginLeft: 10,
              }}
            >
              Exposure:{' '}
            </Text>
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 20,
                fontWeight: '300',
                color: '#909192',
              }}
            >
              {fridge.getTemperatureExposure()}
            </Text>
          </View>
          <View
            style={{
              marginLeft: 5,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {fridge.getTotalStock() > 0 ? (
              <Text
                style={{
                  fontFamily: APP_FONT_FAMILY,
                  fontSize: 15,
                  marginLeft: 10,
                  fontWeight: '400',
                  color: SUSSOL_ORANGE,
                }}
              >
                Total Stock:
              </Text>
            ) : null}
            {fridge.getTotalStock() > 0 ? (
              <Text
                style={{
                  fontFamily: APP_FONT_FAMILY,
                  fontSize: 15,
                  marginLeft: 5,
                  fontWeight: '300',
                  color: SUSSOL_ORANGE,
                }}
              >
                {fridge.getTotalStock()}
              </Text>
            ) : null}
            {fridge.getTotalStock() === 0 ? (
              <Text
                style={{
                  fontFamily: APP_FONT_FAMILY,
                  fontSize: 15,
                  fontWeight: '400',
                  color: SUSSOL_ORANGE,
                  margin: 3,
                  marginLeft: 5,
                  marginRight: 6,
                }}
              >
                Empty Fridge
              </Text>
            ) : null}
            {fridge.getTotalStock() > 0 ? (
              <Icon
                style={{ margin: 3, marginLeft: 5, marginRight: 6 }}
                name="angle-double-right"
                size={15}
                color={SUSSOL_ORANGE}
              />
            ) : null}
          </View>
        </View>
        {this.state.selectedFridge === fridge.code && (
          <View style={{ height: 250, alignSelf: 'stretch' }}>
            <VaccineChart {...fridge.getTemperaturePoints()} />
          </View>
        )}
      </View>
    </View>
  );

  render() {
    const { fridges } = this.state;
    return (
      <View style={[globalStyles.pageContentContainer, localStyles.pageContentContainer]}>
        <View style={localStyles.section}>
          <Image
            style={localStyles.image}
            resizeMode="contain"
            source={require('../images/menu_vaccines.png')}
          />
          {this.renderButton({ text: 'Customer Invoice', onPress: () => console.log('yow') })}
          {this.renderButton({ text: 'Supplier Invoice', onPress: () => console.log('yow') })}
          {this.renderButton({ text: 'Order Stock', onPress: () => console.log('yow') })}
          {this.renderButton({ text: 'Manage Stock', onPress: () => console.log('yow') })}
        </View>
        {fridges.map(this.renderFridge)}
      </View>
    );
  }
}

export default VaccineModulePage;

/* eslint-disable react/require-default-props, react/forbid-prop-types */
VaccineModulePage.propTypes = {
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
    justifyContent: 'flex-start',
  },
  menuButton: {
    width: null,
    minWidth: 190,
    height: 60,
    padding: 20,
  },
  section: {
    margin: 10,
    flexDirection: 'row',
    borderColor: SHADOW_BORDER,
    borderWidth: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  image: {
    height: 70,
    width: 70,
    marginLeft: 20,
  },
});
