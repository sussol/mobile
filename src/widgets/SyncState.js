/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Text, View } from 'react-native';

import { SyncIcon } from './SyncIcon';

import { syncStrings } from '../localization';
import { formatDate } from '../utilities';
import globalStyles from '../globalStyles';

const mapStateToProps = state => {
  const { sync } = state;
  return sync;
};

export const SyncStateComponent = ({ lastSyncTime, isSyncing, errorMessage, showText }) => {
  const syncMessage = isSyncing ? syncStrings.sync_enabled : syncStrings.sync_in_progress;
  const formattedDate = formatDate(lastSyncTime, 'dots');
  const errorText = `${syncStrings.sync_error}. ${syncStrings.last_sync} ${formattedDate}`;
  const hasError = !!errorMessage?.length;

  return (
    <View style={globalStyles.navBarRightContainer}>
      {showText && (
        <Text style={globalStyles.navBarText}>{hasError ? errorText : syncMessage}</Text>
      )}
      <SyncIcon isActive={!hasError} />
    </View>
  );
};

SyncStateComponent.defaultProps = {
  showText: true,
};

SyncStateComponent.propTypes = {
  lastSyncTime: PropTypes.number.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  showText: PropTypes.bool,
};

export const SyncState = connect(mapStateToProps)(SyncStateComponent);
