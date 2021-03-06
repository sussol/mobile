/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-community/picker';

import globalStyles, { DARKER_GREY, SUSSOL_ORANGE } from '../globalStyles';

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
    const onChange = React.useCallback(
      (value, index) => {
        if (headerValue && index === 0) return;

        // If using a header - offset the index passed.
        if (headerValue) onValueChange(value, index - 1);
        else onValueChange(value, index);
      },
      [onValueChange]
    );

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
      [values]
    );
    const withHeader = React.useMemo(() => [header, ...items], [header, items]);

    return (
      <Picker
        selectedValue={selectedValue ?? headerValue}
        mode="dropdown"
        onValueChange={onChange}
        style={{ ...globalStyles.picker, ...globalStyles.pickerText, ...style }}
        enabled={!isDisabled}
      >
        {headerValue ? withHeader : items}
      </Picker>
    );
  }
);

export default DropDown;

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
