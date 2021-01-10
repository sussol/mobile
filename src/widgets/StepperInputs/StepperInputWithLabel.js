/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Text, View } from 'react-native';
import propTypes from 'prop-types';

import { BaseStepperInput } from './BaseStepperInput';

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
  containerStyle: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  textStyle: { marginRight: 20, fontSize: 14, fontFamily: 'Roboto-Medium' },
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
