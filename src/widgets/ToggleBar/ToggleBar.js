import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Renders a bar of multiple toggling buttons, defined by the array of 'options' passed in.
 * Selected toggles are controlled by state in parent.
 * @param   {object}          props               Properties passed where component was created.
 * @prop    {StyleSheet}      style               Style of the containing View.
 * @prop    {StyleSheet}      optionStyle         Style of the TouchableOpacities when not isSelected.
 * @prop    {StyleSheet}      optionSelectedStyle Style of the TouchableOpacities when isSelected.
 * @prop    {StyleSheet}      textStyle           Style of the Text when not isSelected.
 * @prop    {StyleSheet}      textSelectedStyle   Style of the Text when  isSelected.
 * @prop    {array<object>}   options             Array of objects representing each button in the
 *                                                toggle bar, in order left to right, top to bottom.
 * @return  {React.Component}                     Returns a View containing the toggle
 *                                                buttons (TouchableOpacity).
 *
 * Option array format: [{
                          text: 'string',
                          onPress: 'func',
                          isSelected: 'boolean',
                        }]
 *
 */

export function ToggleBar(props) {
  const {
    style,
    optionStyle,
    optionSelectedStyle,
    textStyle,
    textSelectedStyle,
    options,
    ...containerProps,
  } = props;

  function renderOptions(buttons) {
    if (buttons.length === 0) return [];
    const renderOutput = [];

    buttons.forEach((button, i) => {
      const currentTextStyle = button.isSelected ?
        [localStyles.textSelectedStyle, textSelectedStyle] :
        [localStyles.textStyle, textStyle];
      const currentOptionStyle = button.isSelected ?
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
  optionSelectedStyle: View.propTypes.style,
  textStyle: Text.propTypes.style,
  textSelectedStyle: Text.propTypes.style,
};

ToggleBar.defaultProps = {
  style: {},
  optionStyle: {},
  optionSelectedStyle: {},
  textStyle: {},
  textSelectedStyle: {},
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
  },
  textSelectedStyle: {
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
