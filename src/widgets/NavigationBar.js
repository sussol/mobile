/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { textStyles } from '../globalStyles';

const NavigationBar = props => {
  const { onPressBack, LeftComponent, CentreComponent, RightComponent } = props;

  return (
    <View style={localStyles.container}>
      <View style={localStyles.leftSection}>
        <TouchableOpacity onPress={onPressBack} style={localStyles.backButton}>
          {onPressBack && <Icon name="chevron-left" style={localStyles.backIcon} />}
        </TouchableOpacity>
        {LeftComponent && <LeftComponent />}
      </View>
      <View style={localStyles.centreSection}>{CentreComponent && <CentreComponent />}</View>
      <View style={localStyles.rightSection}>{RightComponent && <RightComponent />}</View>
    </View>
  );
};

export { NavigationBar };
export default NavigationBar;

NavigationBar.propTypes = {
  onPressBack: PropTypes.func,
  LeftComponent: PropTypes.any,
  CentreComponent: PropTypes.any,
  RightComponent: PropTypes.any,
};

NavigationBar.defaultProps = {
  onPressBack: null,
  LeftComponent: null,
  CentreComponent: null,
  RightComponent: null,
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 36 : 36;

const sectionStyle = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 20,
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: STATUSBAR_HEIGHT,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    height: HEADER_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  backIcon: {
    marginRight: 30,
    ...textStyles,
  },
  leftSection: {
    ...sectionStyle,
  },
  centreSection: {
    ...sectionStyle,
    justifyContent: 'center',
  },
  rightSection: {
    ...sectionStyle,
    justifyContent: 'flex-end',
  },
});
