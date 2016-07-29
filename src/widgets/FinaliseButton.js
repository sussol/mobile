import React from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles from '../globalStyles';

export function FinaliseButton(props) {
  if (props.isFinalised) {
    return (
      <View style={[globalStyles.navBarRightContainer, localStyles.outerContainer]}>
        <Text style={[globalStyles.navBarText, localStyles.text]}>
          {'FINALISED. CANNOT BE EDITED'}
        </Text>
        <Icon
          name="lock"
          style={globalStyles.finalisedLock}
        />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[globalStyles.navBarRightContainer, localStyles.outerContainer]}
      onPress={props.onPress}
    >
      <Text style={[globalStyles.navBarText, localStyles.text]}>
        {'FINALISE'}
      </Text>
      <Icon
        name="check-circle"
        style={globalStyles.finaliseButton}
      />
    </TouchableOpacity>
  );
}

FinaliseButton.propTypes = {
  isFinalised: React.PropTypes.bool.isRequired,
  onPress: React.PropTypes.func,
};
FinaliseButton.defaultProps = {
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
