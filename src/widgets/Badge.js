/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */

import React from 'react';

import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity, ViewPropTypes } from 'react-native';
import { SUSSOL_ORANGE } from '../globalStyles/index';

const BadgeComponent = (props, ref) => {
  const {
    containerStyle = localStyles.badgeStyle,
    textStyle = localStyles.textStyle,
    badgeStyle,
    onPress,
    Component = onPress ? TouchableOpacity : View,
    value,
    ...attributes
  } = props;

  return (
    <Component {...attributes} ref={ref} style={containerStyle} onPress={onPress}>
      <Text style={textStyle}>{value}</Text>
    </Component>
  );
};

const localStyles = StyleSheet.create({
  badgeStyle: {
    alignSelf: 'center',
    width: Dimensions.get('window').width / 25,
    height: Dimensions.get('window').height / 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
  },
  textStyle: { fontSize: 16, color: '#FFF', paddingHorizontal: 4, fontWeight: 'bold' },
});

const Badge = React.forwardRef(BadgeComponent);

Badge.propTypes = {
  containerStyle: ViewPropTypes.style,
  badgeStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onPress: PropTypes.func,
  Component: PropTypes.elementType,
};

export default Badge;
