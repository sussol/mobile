import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';

/* <ToggleBar
 *   style={StyleSheet}
 *   buttonStyle={StyleSheet}
 *   textStyle={StyleSheet}
 *   selectedTextStyle={StyleSheet}
 *   selectedStyle={StyleSheet}
 * >
 *   <ToggleButton onPress={func} selected={bool} />
 *   <ToggleButton onPress={func} selected={bool} />
 *   <ToggleButton onPress={func} selected={bool} />
 * </ToggleBar>
 */
export function ToggleBar(props) {
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

};

ToggleBar.defaultProps = {

};

export function ToggleButton(props) {

}

ToggleButton.propTypes = {

};

ToggleButton.defaultProps = {

};
