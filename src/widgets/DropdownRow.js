/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';

import { DropDown } from './DropDown';
import { FlexRow } from './FlexRow';

import { SUSSOL_ORANGE, APP_FONT_FAMILY } from '../globalStyles';

/**
 * Layout component rendering a Dropdown and a TextInput.
 *
 * @prop {Text}   currentOptionText Text to display for the label text prop.
 * @prop {Array}  options           The options of the drop down. See PopoverDropdown.
 * @prop {Func}   onSelection       Callback when selecting a dropdown option.
 * @prop {String} dropdownTitle     The title of the drop down menu when opened.
 * @prop {String} placeholder       Placeholder string value, when no value has been chosen/entered.
 * @prop {Bool}   isDisabled        Indicator if this component should not be editable.
 */
export const DropdownRow = ({
  currentOptionText,
  options,
  onSelection,
  dropdownTitle,
  placeholder,
  isDisabled,
  onChangeText,
}) => (
  <FlexRow alignItems="center" justifyContent="center">
    <DropDown
      style={localStyles.dropDownStyle}
      values={options}
      onValueChange={onSelection}
      headerValue={dropdownTitle}
      isDisabled={!options.length}
    />

    <TextInput
      editable={!isDisabled}
      onChangeText={onChangeText}
      value={currentOptionText}
      underlineColorAndroid={SUSSOL_ORANGE}
      style={localStyles.textInputStyle}
      placeholder={placeholder}
    />
  </FlexRow>
);

const localStyles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconsContainerStyle: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    flex: 1,
  },
  textInputStyle: {
    flex: 19,
    fontFamily: APP_FONT_FAMILY,
  },
  dropDownStyle: {
    flex: 2,
    marginBottom: 0,
    marginLeft: 0,
    marginTop: 0,
  },
});

DropdownRow.defaultProps = {
  placeholder: '',
  currentOptionText: '',
  isDisabled: false,
};

DropdownRow.propTypes = {
  currentOptionText: PropTypes.string,
  options: PropTypes.array.isRequired,
  onSelection: PropTypes.func.isRequired,
  dropdownTitle: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isDisabled: PropTypes.bool,
};
