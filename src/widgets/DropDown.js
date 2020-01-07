/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'react-native';

import { COMPONENT_HEIGHT, SUSSOL_ORANGE } from '../globalStyles';

export const DropDown = React.memo(({ values, selectedValue, onValueChange, style }) => {
  const Items = values.map(value => (
    <Picker.Item key={value} label={value} value={value} color={SUSSOL_ORANGE} />
  ));
  return (
    <Picker
      selectedValue={selectedValue}
      mode="dropdown"
      onValueChange={onValueChange}
      style={{ ...localStyles.picker, ...localStyles.pickerText, ...style }}
    >
      {Items}
    </Picker>
  );
});

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
};

DropDown.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.array.isRequired,
  selectedValue: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
