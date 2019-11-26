/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, View, ViewPropTypes } from 'react-native';

import { SyncIcon } from './SyncIcon';
import { syncStrings } from '../localization/index';
import { formatDate } from '../utilities';

import globalStyles, { GREY, DARK_GREY } from '../globalStyles';

const ACTIVE_COLOR = DARK_GREY;
const INACTIVE_COLOR = GREY;

export const SyncState = props => {
  const { state, style, showText } = props;

  let text = syncStrings.sync_enabled;
  let cloudColor = ACTIVE_COLOR;
  let arrowsColor = ACTIVE_COLOR;
  let wifiColor = ACTIVE_COLOR;

  const { lastSyncTime, isSyncing, errorMessage } = state;

  if (isSyncing) {
    text = syncStrings.sync_in_progress;
  } else if (errorMessage && errorMessage.length > 0) {
    const lastSync = lastSyncTime && formatDate(new Date(lastSyncTime), 'dots');
    text = syncStrings.sync_error;
    if (lastSync) text = `${text}. ${syncStrings.last_sync} ${lastSync}`;
    cloudColor = INACTIVE_COLOR;
    arrowsColor = INACTIVE_COLOR;
    wifiColor = INACTIVE_COLOR;
  }

  return (
    <View style={[globalStyles.navBarRightContainer, style]}>
      {showText && <Text style={[globalStyles.navBarText, localStyles.text]}>{text}</Text>}
      <SyncIcon cloudColor={cloudColor} arrowsColor={arrowsColor} wifiColor={wifiColor} />
    </View>
  );
};

export default SyncState;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
SyncState.propTypes = {
  state: PropTypes.object.isRequired,
  showText: PropTypes.bool,
  style: ViewPropTypes.style,
};
SyncState.defaultProps = {
  showText: true,
};

const localStyles = StyleSheet.create({
  iconActive: {
    color: DARK_GREY,
  },
  iconInactive: {
    color: GREY,
  },
  text: {
    marginRight: 25,
  },
});
