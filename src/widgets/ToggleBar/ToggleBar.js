/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TouchableOpacity, ViewPropTypes, View } from 'react-native';
import globalStyles from '../../globalStyles';

/**
 * Renders a bar of multiple toggling buttons, defined by the array 'toggles' passed in.
 * State in the parent should control the isOn of each toggle.
 * @param   {object}          props             Properties passed where component was created.
 * @prop    {StyleSheet}      style             Style of the containing View.
 * @prop    {StyleSheet}      toggleOffStyle    Style of the TouchableOpacities when not isOn.
 * @prop    {StyleSheet}      toggleOnStyle     Style of the TouchableOpacities when isOn.
 * @prop    {StyleSheet}      textOffStyle      Style of the Text when not isOn.
 * @prop    {StyleSheet}      textOnStyle       Style of the Text when  isOn.
 * @prop    {array<object>}   toggles           Array of objects representing each button in the
 *                                              toggle bar, in order left to right, top to bottom.
 * @return  {React.Component}                   Returns a View containing the toggle
 *                                              buttons (TouchableOpacity).
 *
 * toggles array format: [{
                          text: 'string',
                          onPress: 'func',
                          isOn: 'boolean',
                        }]
 *
 */

export const ToggleBarComponent = props => {
  const {
    style,
    toggleOffStyle,
    toggleOnStyle,
    textOffStyle,
    textOnStyle,
    toggles,
    ...containerProps
  } = props;

  const renderToggles = buttons => {
    if (buttons.length === 0) return [];
    const renderOutput = [];

    buttons.forEach((button, i) => {
      const currentTextStyle = button.isOn
        ? [localStyles.textOnStyle, textOnStyle]
        : [localStyles.textOffStyle, textOffStyle];
      const currentToggleStyle = button.isOn
        ? [localStyles.toggleOnStyle, toggleOnStyle]
        : [localStyles.toggleOffStyle, toggleOffStyle];

      renderOutput.push(
        <TouchableOpacity
          // TODO: use key which is not index.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={currentToggleStyle}
          onPress={button.onPress}
        >
          <Text style={currentTextStyle}>{button.text}</Text>
        </TouchableOpacity>
      );
    });

    return renderOutput;
  };

  return (
    <View style={[localStyles.container, style]} {...containerProps}>
      {renderToggles(toggles)}
    </View>
  );
};

export const ToggleBar = React.memo(ToggleBarComponent);

export default ToggleBar;

ToggleBarComponent.propTypes = {
  style: ViewPropTypes.style,
  // eslint-disable-next-line react/require-default-props, react/forbid-prop-types
  toggles: PropTypes.array,
  toggleOffStyle: ViewPropTypes.style,
  toggleOnStyle: ViewPropTypes.style,
  textOffStyle: Text.propTypes.style,
  textOnStyle: Text.propTypes.style,
};

ToggleBarComponent.defaultProps = {
  style: globalStyles.toggleBar,
  toggleOffStyle: globalStyles.toggleOption,
  toggleOnStyle: globalStyles.toggleOptionSelected,
  textOffStyle: globalStyles.toggleText,
  textOnStyle: globalStyles.toggleTextSelected,
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: 45,
    borderWidth: 1,
  },
  toggleOffStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 142,
  },
  toggleOnStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 142,
    backgroundColor: 'rgb(114, 211, 242)',
  },
});
