/* eslint-disable react/forbid-prop-types */
import React from 'react';
import propTypes from 'prop-types';
import { View, TouchableOpacity } from 'react-native';
import { PlusCircle } from '../icons';
import { BACKGROUND_COLOR } from '../../globalStyles';

export const BaseStepperButton = ({ TouchableProps, TouchableImpl, containerStyle, Content }) => (
  <TouchableImpl {...TouchableProps}>
    <View style={containerStyle}>{Content}</View>
  </TouchableImpl>
);

BaseStepperButton.defaultProps = {
  TouchableImpl: TouchableOpacity,
  TouchableProps: {},
  Content: <PlusCircle />,
  containerStyle: {
    width: 50,
    backgroundColor: BACKGROUND_COLOR,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
BaseStepperButton.propTypes = {
  Content: propTypes.node,
  TouchableProps: propTypes.object,
  TouchableImpl: propTypes.object,
  containerStyle: propTypes.object,
};
