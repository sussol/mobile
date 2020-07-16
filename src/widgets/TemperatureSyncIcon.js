/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GREY, DARK_GREY } from '../globalStyles';
import { SyncArrow, SyncArrowDisabled, SyncArrowProblem } from './icons';

export const TemperatureSyncIcon = React.memo(({ hasError, isDisabled }) => {
  const iconColor = isDisabled ? DARK_GREY : GREY;

  let Icon = <SyncArrow color={iconColor} />;
  if (isDisabled) Icon = <SyncArrowDisabled color={iconColor} />;
  if (hasError) Icon = <SyncArrowProblem color={iconColor} />;

  return Icon;
});

TemperatureSyncIcon.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  hasError: PropTypes.bool.isRequired,
};
