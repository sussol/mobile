/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { GREY, DARK_GREY } from '../globalStyles';
import { CloudIcon, ArrowIcon, WifiIcon } from './icons';

export const SyncIcon = ({ isActive }) => {
  const iconColor = isActive ? DARK_GREY : GREY;

  return (
    <>
      <CloudIcon color={iconColor} />
      <ArrowIcon color={iconColor} />
      <WifiIcon color={iconColor} />
    </>
  );
};

SyncIcon.defaultProps = {
  isActive: true,
};

SyncIcon.propTypes = {
  isActive: PropTypes.bool,
};
