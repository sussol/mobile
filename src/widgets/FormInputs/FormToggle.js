/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { FormLabel } from './FormLabel';
import { ToggleBar } from '../ToggleBar';
import { FlexView } from '../FlexView';

export const FormToggle = ({ label, options, optionLabels, value, onValueChange, isRequired }) => {
  const toggles = React.useMemo(
    () =>
      options.map((option, index) => ({
        text: optionLabels[index],
        isOn: value === option,
        onPress: () => onValueChange(option, index),
      })),
    [options, onValueChange]
  );

  return (
    <FlexView flex={1}>
      <FormLabel value={label} isRequired={isRequired} />
      <ToggleBar
        toggles={toggles}
        style={{ marginTop: 20 }}
        toggleOnStyle={{ flex: 1 }}
        toggleOffStyle={{ flex: 1 }}
      />
    </FlexView>
  );
};

FormToggle.defaultProps = {
  isRequired: false,
};

FormToggle.propTypes = {
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  optionLabels: PropTypes.array.isRequired,
  value: PropTypes.any.isRequired,
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
};
