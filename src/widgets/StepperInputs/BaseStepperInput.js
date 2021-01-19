/* eslint-disable react/forbid-prop-types */
import React from 'react';
import propTypes from 'prop-types';
import { View } from 'react-native';
import { BaseStepperButton } from './BaseStepperButton';

import { BACKGROUND_COLOR } from '../../globalStyles';

export const BaseStepperInput = ({ containerStyles, LeftButton, RightButton, TextInput }) => (
  <View style={containerStyles}>
    {LeftButton}
    {TextInput}
    {RightButton}
  </View>
);

BaseStepperInput.defaultProps = {
  containerStyles: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 190,
    height: 48,
    backgroundColor: BACKGROUND_COLOR,
  },
  LeftButton: <BaseStepperButton />,
  RightButton: null,
};

BaseStepperInput.propTypes = {
  LeftButton: propTypes.node,
  RightButton: propTypes.node,
  TextInput: propTypes.node.isRequired,
  containerStyles: propTypes.object,
};
