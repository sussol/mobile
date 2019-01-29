/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Badge } from 'react-native-elements';
import { SUSSOL_ORANGE, BACKGROUND_COLOR } from '../../globalStyles';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewPropTypes,
  View,
} from 'react-native';

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

export function ToggleBar(props) {
  const {
    style,
    toggleOffStyle,
    toggleOnStyle,
    textOffStyle,
    textOnStyle,
    toggles,
    ...containerProps
  } = props;

  function renderToggles(buttons) {
    if (buttons.length === 0) return [];
    const renderOutput = [];

    buttons.forEach((button, i) => {
      console.log(button.badgeValue, 'about to render');
      const currentTextStyle = button.isOn ?
        [localStyles.textOnStyle, textOnStyle] :
        [localStyles.textOffStyle, textOffStyle];
      const currentToggleStyle = button.isOn ?
        [localStyles.toggleOnStyle, toggleOnStyle] :
        [localStyles.toggleOffStyle, toggleOffStyle];
      const currentTextColor = !button.isOn ?
        { color: '#FFF' } :
        { color: SUSSOL_ORANGE };
      const currentBackgroudColor = button.isOn ?
        { backgroundColor: 'rgb(236,243,252)' } :
        { backgroundColor: SUSSOL_ORANGE };

      renderOutput.push(
        <TouchableOpacity key={i} style={currentToggleStyle} onPress={button.onPress}>

          <Text style={currentTextStyle}>{button.text}</Text>
          { (!button.badgeValue || button.badgeValue === 0) ? null : (
           <Badge
            value={button.badgeValue}
            wrapperStyle={{ width: 45 }}
            containerStyle={{ ...currentBackgroudColor, bottom: 17, borderColor: SUSSOL_ORANGE, borderWidth: 1, left: 57, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}
            textStyle={{ ...currentTextColor, fontSize: 10 }}
           />
          )}
        </TouchableOpacity>
      );
    });

    return renderOutput;
  }

  return (
    <View style={[localStyles.container, style]} {...containerProps}>
      {renderToggles(toggles)}
    </View>
  );
}

ToggleBar.propTypes = {
  style: ViewPropTypes.style,
  toggles: PropTypes.array,
  toggleOffStyle: ViewPropTypes.style,
  toggleOnStyle: ViewPropTypes.style,
  textOffStyle: Text.propTypes.style,
  textOnStyle: Text.propTypes.style,
};

ToggleBar.defaultProps = {
  style: {},
  toggleOffStyle: {},
  toggleOnStyle: {},
  textOffStyle: {},
  textOnStyle: {},
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
    width: 140,
  },
  toggleOnStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    backgroundColor: 'rgb(114, 211, 242)',
  },
});
