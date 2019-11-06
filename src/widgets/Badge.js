/* eslint-disable react/require-default-props */
/* Taken from https://github.com/react-native-training/react-native-elements
 * since we only need badge component. Tweaked the component class since we do not
 * need extra logic present in the code.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, ViewPropTypes } from 'react-native';
import { SUSSOL_ORANGE } from '../globalStyles/index';

const Badge = props => {
  const {
    containerStyle,
    textStyle,
    badgeStyle,
    onPress,
    Component = onPress ? TouchableOpacity : View,
    value,
    ...attributes
  } = props;

  return (
    <View style={containerStyle}>
      <Component {...attributes} style={badgeStyle} onPress={onPress}>
        <Text style={textStyle}>{value}</Text>
      </Component>
    </View>
  );
};

Badge.propTypes = {
  containerStyle: ViewPropTypes.style,
  badgeStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onPress: PropTypes.func,
  Component: PropTypes.elementType,
};

Badge.defaultProps = {
  containerStyle: {},
  textStyle: { fontSize: 16, color: '#FFF', paddingHorizontal: 4, fontWeight: 'bold' },
  badgeStyle: {
    alignSelf: 'center',
    width: 65,
    height: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
  },
};

export default Badge;
