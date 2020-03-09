/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';

import { GREY, DARK_GREY } from '../globalStyles';
import { CloudIcon, ArrowIcon, WifiIcon } from './icons';

export const SyncIcon = ({ isActive }) => {
  const iconColor = isActive ? DARK_GREY : GREY;

  return (
    <View style={localStyles.horizontalContainer}>
      <CloudIcon color={iconColor} />
      <ArrowIcon color={iconColor} />
      <WifiIcon color={iconColor} />
    </View>
  );
};

SyncIcon.defaultProps = {
  isActive: true,
};

SyncIcon.propTypes = {
  isActive: PropTypes.bool,
};

SyncIcon.defaultProps = {};

const localStyles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  icon: {
    marginLeft: 10,
  },
});
