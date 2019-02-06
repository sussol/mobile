/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import { ToggleBar } from './ToggleBar';

import globalStyles from '../globalStyles';

/**
 * A selector based on the ToggleBar, will highlight currently selected
 * @prop  {array}     options   The options to display in the selector
 * @prop  {any}       selected  The option that is currently selected
 * @prop  {function}  onSelect  A function taking the option selected
 *                              as a parameter
 */
export function ToggleSelector(props) {
  const { options, onSelect } = props;
  const toggles = options.map(option => {
    return {
      text: String(option),
      onPress: () => {
        onSelect(option);
      },
      isOn: props.selected === option,
    };
  });

  return (
    <ToggleBar
      style={globalStyles.toggleBar}
      textOffStyle={globalStyles.toggleText}
      textOnStyle={globalStyles.toggleTextSelected}
      toggleOffStyle={globalStyles.toggleOption}
      toggleOnStyle={globalStyles.toggleOptionSelected}
      toggles={toggles}
    />
  );
}

export default ToggleSelector;

ToggleSelector.propTypes = {
  selected: PropTypes.number.isRequired,
  // eslint-disable-next-line react/require-default-props
  onSelect: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array.isRequired,
};
