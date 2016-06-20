import React, {
  PropTypes,
} from 'react';

import {
  View,
  TouchableOpacity,
  Text,
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

    buttons.forEach((button) => {
      const currentTextStyle = button.selected ? [textStyle, textSelectedStyle] : textStyle;
      const currentOptionStyle = button.selected ? [optionStyle, optionSelectedStyle] : optionStyle;
      renderOutput.push(
        <TouchableOpacity style={currentOptionStyle}>
          <Text style={currentTextStyle}>{button.text}</Text>
        </TouchableOpacity>
      );
    });

    return renderOutput;
  }

  return (
    <View style={style} {...containerProps}>
      {renderOptions(options.slice(0, -1))}
    </View>
  );
}

ToggleBar.propTypes = {
  style: View.propTypes.style,
  options: PropTypes.array,
  optionStyle: TouchableOpacity.propTypes.style,
  textStyle: Text.propTypes.style,
  optionSelectedStyle: TouchableOpacity.propTypes.style,
  textSelectedStyle: Text.propTypes.style,
  children: React.PropTypes.array,
};

ToggleBar.defaultProps = {
  style: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: 45,
    borderWidth: 1,
    borderRadius: 4,
  },
  optionStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
  },
  textStyle: {
    fontSize: 20,
  },
  optionSelectedStyle: {
    backgroundColor: 'rgb(114, 211, 242)',
  },
  textSelectedStyle: {
  },
};
