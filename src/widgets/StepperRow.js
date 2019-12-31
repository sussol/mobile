/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { SimpleLabel } from './SimpleLabel';
import { StepperInput } from './StepperInput';

/**
 * Layout component for a StepperInput and SimpleLabel. Wraps both components
 * and renders each as a row with a 5/1/3 flex - where the 1 is a filler view
 * for a little extra space for the Stepper.
 *
 * Takes the main props of each a SimpleLabel and StepperInput. See the individual
 * components for further details.
 *
 * @prop {String}        text           Label text value.
 * @prop {Number|String} quantity       Initial value of the stepper input.
 * @prop {Func}          onChangeValue  Callback when the stepper value changes.
 * @prop {Number}        lowerLimit     Lower bound valid value of the stepper.
 * @prop {Number}        upperLimit     Upper bound valid value of the stepper.
 * @prop {String}        labelSize      Size of the label: See SimpleLabel for valid values.
 * @prop {Bool}          isDisabled     Indicator if this component should be editable.
 */
export const StepperRow = ({
  text,
  quantity,
  onChangeValue,
  lowerLimit,
  upperLimit,
  labelSize,
  isDisabled,
}) => {
  const { containerStyle, largeFlex, mediumFlex, smallFlex } = localStyles;
  return (
    <View style={containerStyle}>
      <View style={largeFlex}>
        <SimpleLabel size={labelSize} text={text} />
      </View>
      <View style={smallFlex} />
      <View style={mediumFlex}>
        <StepperInput
          isDisabled={isDisabled}
          value={quantity}
          onChangeText={onChangeValue}
          lowerLimit={lowerLimit}
          upperLimit={upperLimit}
        />
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  containerStyle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  largeFlex: { flex: 5 },
  mediumFlex: { flex: 3 },
  smallFlex: { flex: 1 },
});

StepperRow.defaultProps = {
  lowerLimit: 1,
  upperLimit: 99999,
  labelSize: 'large',
  isDisabled: false,
};

StepperRow.propTypes = {
  text: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  onChangeValue: PropTypes.func.isRequired,
  lowerLimit: PropTypes.number,
  upperLimit: PropTypes.number,
  labelSize: PropTypes.oneOf(['large', 'small']),
  isDisabled: PropTypes.bool,
};
