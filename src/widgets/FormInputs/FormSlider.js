/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { FormLabel } from './FormLabel';
import { FlexView } from '../FlexView';
import { Slider } from '../Slider';

export const FormSlider = React.forwardRef(
  ({ label, isRequired, minimumValue, maximumValue, step, value, onValueChange }, ref) => (
    <FlexView flex={1}>
      <FormLabel value={label} isRequired={isRequired} />
      <Slider
        ref={ref}
        onEndEditing={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
      />
    </FlexView>
  )
);

FormSlider.defaultProps = {
  isRequired: false,
  minimumValue: 0,
  maximumValue: 100,
};

FormSlider.propTypes = {
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  step: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
};
