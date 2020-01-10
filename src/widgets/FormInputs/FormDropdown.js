/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { DropDown } from '../DropDown';
import { FormLabel } from './FormLabel';
import { FlexColumn } from '../FlexColumn';

export const FormDropdown = ({ isRequired, label, onValueChange, options, optionKey, value }) => {
  const valueStrings = options.map(({ [optionKey]: valueString }) => valueString);
  const onValueChangeCallback = (_, index) => onValueChange(options[index]);

  return (
    <FlexColumn flex={1}>
      <FormLabel value={label} isRequired={isRequired} />
      <DropDown
        style={{ width: null, flex: 1 }}
        values={valueStrings}
        selectedValue={value}
        onValueChange={onValueChangeCallback}
      />
    </FlexColumn>
  );
};

FormDropdown.propTypes = {
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  optionKey: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool.isRequired,
};
