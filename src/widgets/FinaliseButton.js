/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles from '../globalStyles';
import { navStrings } from '../localization';

export function FinaliseButton(props) {
  const { isFinalised, onPress } = props;

  if (isFinalised) {
    return (
      <View style={[globalStyles.navBarRightContainer, localStyles.outerContainer]}>
        <Text style={[globalStyles.navBarText, localStyles.text]}>
          {navStrings.finalised_cannot_be_edited}
        </Text>
        <Icon name="lock" style={globalStyles.finalisedLock} />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[globalStyles.navBarRightContainer, localStyles.outerContainer]}
      onPress={onPress}
    >
      <Text style={[globalStyles.navBarText, localStyles.text]}>{navStrings.finalise}</Text>
      <Icon name="check-circle" style={globalStyles.finaliseButton} />
    </TouchableOpacity>
  );
}

export default FinaliseButton;

FinaliseButton.propTypes = {
  // eslint-disable-next-line react/require-default-props
  isFinalised: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/require-default-props
  onPress: PropTypes.func,
};
FinaliseButton.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  isFinalised: false,
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
