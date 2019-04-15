/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Image, StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-ui-components';
import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles, { SHADOW_BORDER, APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';

/* eslint-disable global-require */

export class VaccineModulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fridges: [] };
  }

  componentWillMount() {
    const { database } = this.props;
    this.setState({ fridges: database.objects('Location').filter(({ isFridge }) => isFridge) });
  }

  renderButton = buttonProps => (
    <Button
      style={[globalStyles.menuButton, localStyles.menuButton]}
      textStyle={globalStyles.menuButtonText}
      {...buttonProps}
    />
  );

  renderFridge = fridge => (
    <View>
      <View style={[localStyles.section, { flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <View style={{ margin: 5, alignSelf: 'flex-end', flexDirection: 'row' }}>
            {fridge.description !== 'Main Fridge' && (
              <Icon
                style={{ margin: 3, marginRight: 6 }}
                name="chevron-down"
                size={15}
                color={SUSSOL_ORANGE}
              />
            )}
            {fridge.description === 'Main Fridge' && (
              <Image
                style={{ height: 15, width: 15, margin: 3 }}
                resizeMode="contain"
                source={require('../images/fridge.png')}
              />
            )}
            <Text style={{ fontFamily: APP_FONT_FAMILY, fontSize: 20, color: SUSSOL_ORANGE }}>
              {fridge.description}
            </Text>
          </View>
          <View style={{ marginLeft: 5, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 30,
                fontWeight: '400',
                color: '#909192',
              }}
            >
              3.5
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
          <View
            style={{
              marginLeft: 5,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 15,
                fontWeight: '400',
                color: '#909192',
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
              0.5℃ to 8.9℃
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
            <Text
              style={{
                fontFamily: APP_FONT_FAMILY,
                fontSize: 15,
                marginLeft: 5,
                fontWeight: '300',
                color: SUSSOL_ORANGE,
              }}
            >
              100
            </Text>
            <Icon
              style={{ margin: 3, marginLeft: 5, marginRight: 6 }}
              name="angle-double-right"
              size={15}
              color={SUSSOL_ORANGE}
            />
          </View>
        </View>
        {fridge.description === 'Main Fridge' && (
          <View style={{ height: 100 }}>
            <Text>Graph Here</Text>
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
