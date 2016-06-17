import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';

export default function ToggleBar(props) {
  function renderLeftButton() {

  }
  function renderMiddleButtons() {

  }
  function renderRightButton() {

  }

  return (
    <View>
    {renderLeftButton()}
    {renderMiddleButtons()}
    {renderRightButton()}
    </View>
  );
}

ToggleBar.propTypes = {
  buttonFunctionPairs: PropTypes.object.isRequired,
  selectedButtons: PropTypes.array.isRequired,
  selectedStyle: TouchableOpacity.style,
  style: TouchableOpacity.style,
  textStyle: Text.style,
};

ToggleBar.defaultProps = {
};
