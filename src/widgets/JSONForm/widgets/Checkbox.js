/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { SUSSOL_ORANGE, WARMER_GREY } from '../../../globalStyles/colors';
import { ToggleBar } from '../../index';

export const Checkbox = ({ options: { enumOptions }, value, onChange, disabled, readonly }) => {
  const toggles = enumOptions.map(({ label, value: enumValue }) => ({
    text: label,
    isOn: enumValue === value,
    onPress: () => onChange(enumValue),
  }));

  return (
    <ToggleBar
      isDisabled={disabled || readonly}
      toggleOnStyle={styles.toggleOnStyle}
      toggleOffStyle={styles.toggleOffStyle}
      toggleOnDisabledStyle={styles.toggleOnDisabledStyle}
      toggles={toggles}
    />
  );
};

const styles = StyleSheet.create({
  toggleOnStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
  },
  toggleOffStyle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleOnDisabledStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WARMER_GREY,
  },
});

Checkbox.propTypes = {
  options: PropTypes.object.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  readonly: PropTypes.bool.isRequired,
};
