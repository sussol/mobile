/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Text, View } from 'react-native';
import propTypes from 'prop-types';

import { BaseStepperInput } from './BaseStepperInput';

import { DARKER_GREY, APP_FONT_FAMILY } from '../../globalStyles';

export const StepperInputWithLabel = ({
  containerStyle,
  textStyle,
  label,
  LeftButton,
  RightButton,
  TextInput,
  ...stepperProps
}) => (
  <View style={containerStyle}>
    <Text style={textStyle}>{label}</Text>
    <BaseStepperInput
      LeftButton={LeftButton}
      RightButton={RightButton}
      TextInput={TextInput}
      {...stepperProps}
    />
  </View>
);

StepperInputWithLabel.defaultProps = {
  containerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textStyle: {
    marginRight: 10,
    fontSize: 12,
    minWidth: 90,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
  },
  label: '',
  LeftButton: null,
  RightButton: null,
};

StepperInputWithLabel.propTypes = {
  containerStyle: propTypes.object,
  textStyle: propTypes.object,
  label: propTypes.string,
  RightButton: propTypes.node,
  LeftButton: propTypes.node,
  TextInput: propTypes.node.isRequired,
};
