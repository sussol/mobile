import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export function ToggleBar(props) {
  const {
    style,
    optionStyle,
    textStyle,
    optionSelectedStyle,
    textSelectedStyle,
    options,
    ...containerProps,
  } = props;

  function renderOptions(buttons) {
    if (buttons.length === 0) return [];
    const renderOutput = [];

    buttons.forEach((button, i) => {
      const currentTextStyle = button.selected ?
        [localStyles.textSelectedStyle, textSelectedStyle] :
        [localStyles.textStyle, textStyle];
      const currentOptionStyle = button.selected ?
        [localStyles.optionSelectedStyle, optionSelectedStyle] :
        [localStyles.optionStyle, optionStyle];

      renderOutput.push(
        <TouchableOpacity key={i} style={currentOptionStyle} onPress={button.onPress}>
          <Text style={currentTextStyle}>{button.text}</Text>
        </TouchableOpacity>
      );
    });

    return renderOutput;
  }

  return (
    <View style={[localStyles.container, style]} {...containerProps}>
      {renderOptions(options)}
    </View>
  );
}

ToggleBar.propTypes = {
  style: View.propTypes.style,
  options: PropTypes.array,
  optionStyle: View.propTypes.style,
  textStyle: Text.propTypes.style,
  optionSelectedStyle: View.propTypes.style,
  textSelectedStyle: Text.propTypes.style,
};

ToggleBar.defaultProps = {
  style: {},
  optionStyle: {},
  textStyle: {},
  textSelectedStyle: {},
  optionSelectedStyle: {},
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: 45,
    borderWidth: 1,
  },
  textStyle: {
    fontSize: 20,
  },
  textSelectedStyle: {
    fontSize: 20,
  },
  optionStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
  },
  optionSelectedStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    backgroundColor: 'rgb(114, 211, 242)',
  },
});
