/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'react-native';

import { DARKER_GREY, COMPONENT_HEIGHT, SUSSOL_ORANGE } from '../globalStyles';

/**
 * A single selection dropdown menu implemented as a simple light-weight wrapper over the
 * native Picker component.
 *
 * @param {Array.<string>} values A list of values to render in the dropdown selection.
 * @param {string} selectedValue The currently selected value.
 * @param {Func}   onValueChange On selection callback handler.
 * @param {object} style Optional additional component styling.
 * @param {string} headerValue Optional value for a header within the popup.
 * @param {bool}   isDisabled  Optional inidicator that this dropdown is disabled.
 */
export const DropDown = React.memo(
  ({ values, selectedValue, onValueChange, style, headerValue, isDisabled }) => {
    const header = React.useMemo(
      () => (
        <Picker.Item key={headerValue} label={headerValue} enabled={false} color={DARKER_GREY} />
      ),
      [headerValue]
    );
    const items = React.useMemo(
      () =>
        values.map(value => (
          <Picker.Item key={value} label={value} value={value} color={SUSSOL_ORANGE} />
        )),
      []
    );
    const withHeader = React.useMemo(() => [header, ...items], [header, items]);

    return (
      <Picker
        selectedValue={selectedValue}
        mode="dropdown"
        onValueChange={onValueChange}
        style={{ ...localStyles.picker, ...localStyles.pickerText, ...style }}
        enabled={!isDisabled}
      >
        {headerValue ? withHeader : items}
      </Picker>
    );
  }
);

export default DropDown;

export const localStyles = {
  pickerText: {
    color: SUSSOL_ORANGE,
  },
  picker: {
    marginBottom: 45,
    marginLeft: 8.5,
    marginTop: 10,
    height: COMPONENT_HEIGHT,
    width: 285,
  },
};

DropDown.defaultProps = {
  style: {},
  selectedValue: null,
  headerValue: '',
  isDisabled: false,
};

DropDown.propTypes = {
  values: PropTypes.array.isRequired,
  selectedValue: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  style: PropTypes.object,
  headerValue: PropTypes.string,
  isDisabled: PropTypes.bool,
};
