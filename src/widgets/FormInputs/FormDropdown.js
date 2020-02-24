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

/**
 * Form input rendering a native drop down with a selection of choices
 * passed in through `options` where each element is an object. Each element
 * is displayed to the user represented by the value retrived from the field
 * passed by `optionKey`.
 *
 * @prop {Bool}   isRequired    Indicator whether this input is required.
 * @prop {Bool}   isDisabled    Indicator whether this input is disabled.
 * @prop {String} label         Label to display for this input.
 * @prop {Func}   onValueChange Callback for when a selection has been made.
 * @prop {Array}  options       Array of options [{[optionKey], ..}, {..} ]
 * @prop {String} optionKey     Key of an object within options to display.
 * @prop {value}  value         The currently selected value.
 */
export const FormDropdown = ({
  isRequired,
  label,
  onValueChange,
  options,
  optionKey,
  value,
  isDisabled,
}) => {
  const valueStrings = options.map(({ [optionKey]: valueString }) => valueString);
  const onValueChangeCallback = React.useCallback((_, index) => onValueChange(options[index]), [
    options,
    onValueChange,
  ]);

  return (
    <FlexColumn flex={1}>
      <FormLabel value={label} isRequired={isRequired} />
      <DropDown
        enabled={!isDisabled}
        style={{ width: null, flex: 1 }}
        values={valueStrings}
        selectedValue={value[optionKey]}
        onValueChange={onValueChangeCallback}
      />
    </FlexColumn>
  );
};

FormDropdown.defaultProps = {
  isRequired: false,
  isDisabled: false,
};

FormDropdown.propTypes = {
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  optionKey: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  isDisabled: PropTypes.bool,
};
