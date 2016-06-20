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
 *   selectedButtonStyle={StyleSheet}
 * >
 *   <ToggleButton text="" onPress={func} selected={bool} />
 *   <ToggleButton text="" onPress={func} selected={bool} />
 *   <ToggleButton text="" onPress={func} selected={bool} />
 * </ToggleBar>
 */
export function ToggleBar(props) {
  const {
    style,
    buttonStyle,
    textStyle,
    selectedButtonStyle,
    selectedTextStyle,
    children,
    ...containerProps,
  } = props;

  function renderLeftButton(button) {
    return (
      <TouchableOpacity style={{ backgroundColor: 'green' }}>
        <Text>start</Text>
      </TouchableOpacity>
    );
  }

  function renderMiddleButtons(buttons) {
    if (buttons.length === 0) return [];
    const renderOutput = [];

    buttons.forEach((button) => {
      renderOutput.push(
        <TouchableOpacity style={{ backgroundColor: 'red' }}>
          <Text>mid</Text>
        </TouchableOpacity>
      );
    });

    return renderOutput;
  }

  function renderRightButton(button) {
    return (
      <TouchableOpacity style={{ backgroundColor: 'blue' }}>
        <Text>end</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={style}>
    {renderLeftButton(children[0])}
    {renderMiddleButtons(children.slice(1, -1))}
    {renderRightButton(children[children.length - 1])}
    </View>
  );
}

ToggleBar.propTypes = {
  style: View.propTypes.style,
  buttonStyle: TouchableOpacity.propTypes.style,
  textStyle: Text.propTypes.style,
  selectedButtonStyle: TouchableOpacity.propTypes.style,
  selectedTextStyle: Text.propTypes.style,
  children: React.PropTypes.array,
};

ToggleBar.defaultProps = {

};
