/* eslint-disable react/forbid-prop-types */
import React from 'react';
import propTypes from 'prop-types';
import { View, Pressable } from 'react-native';
import { PlusCircle } from '../icons';
import { BACKGROUND_COLOR } from '../../globalStyles';

export const BaseStepperButton = ({
  TouchableImpl,
  containerStyle,
  Content,
  ...TouchableProps
}) => (
  <TouchableImpl {...TouchableProps}>
    <View style={containerStyle}>{Content}</View>
  </TouchableImpl>
);

BaseStepperButton.defaultProps = {
  TouchableImpl: Pressable,
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
