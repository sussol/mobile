/* eslint-disable react/forbid-prop-types */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles from '../globalStyles';
import { navStrings } from '../localization';

export const FinaliseButton = props => {
  const { isFinalised, onPress, text, fontStyle } = props;
  if (isFinalised) {
    return (
      <View style={[globalStyles.navBarRightContainer, localStyles.outerContainer]}>
        <Text style={[globalStyles.navBarText, localStyles.text, fontStyle]}>
          {text || navStrings.finalised_cannot_be_edited}
        </Text>
        <Icon name="lock" style={globalStyles.finalisedLock} />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[globalStyles.navBarRightContainer, localStyles.outerContainer, fontStyle]}
      onPress={onPress}
    >
      <Text style={[globalStyles.navBarText, localStyles.text]}>{text || navStrings.finalise}</Text>
      <Icon name="check-circle" style={globalStyles.finaliseButton} />
    </TouchableOpacity>
  );
};

export default FinaliseButton;

FinaliseButton.propTypes = {
  isFinalised: PropTypes.bool.isRequired,
  onPress: PropTypes.func,
  fontStyle: PropTypes.object,
  text: PropTypes.string,
};

FinaliseButton.defaultProps = {
  onPress: null,
  fontStyle: {},
  text: '',
};

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56; // Taken from NavigationExperimental
const localStyles = StyleSheet.create({
  outerContainer: {
    height: APPBAR_HEIGHT,
  },
  text: {
    bottom: 12,
  },
});
