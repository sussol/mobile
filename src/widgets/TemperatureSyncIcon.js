/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GREY, DARK_GREY } from '../globalStyles';
import { CloudIcon, ArrowIcon, TemperatureIcon } from './icons';

export const TemperatureSyncIcon = React.memo(({ isActive }) => {
  const iconColor = isActive ? DARK_GREY : GREY;

  return (
    <>
      <CloudIcon color={iconColor} />
      <ArrowIcon color={iconColor} />
      <TemperatureIcon color={iconColor} />
    </>
  );
});

TemperatureSyncIcon.defaultProps = {
  isActive: true,
};

TemperatureSyncIcon.propTypes = {
  isActive: PropTypes.bool,
};
