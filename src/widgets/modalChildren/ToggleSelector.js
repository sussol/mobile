/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { ToggleBar } from '../ToggleBar';

import globalStyles from '../../globalStyles';

/**
 * A selector based on |ToggleBar|, will highlight currently selected.
 *
 * @prop  {array}     options   The options to display in the selector.
 * @prop  {any}       selected  The option that is currently selected.
 * @prop  {function}  onSelect  A function taking the option selected
 *                              as a parameter.
 */
export const ToggleSelector = props => {
  const { options, onSelect } = props;
  const toggles = options.map(option => ({
    text: String(option),
    onPress: () => onSelect(option),
    isOn: props.selected === option,
  }));

  return (
    <ToggleBar
      style={globalStyles.toggleBar}
      textOnStyle={{ ...globalStyles.toggleTextSelected, fontSize: 14 }}
      textOffStyle={{ ...globalStyles.toggleText, fontSize: 14 }}
      toggles={toggles}
    />
  );
};

/* eslint-disable react/forbid-prop-types, react/require-default-props */
ToggleSelector.propTypes = {
  selected: PropTypes.number.isRequired,
  onSelect: PropTypes.func,
  options: PropTypes.array.isRequired,
};
