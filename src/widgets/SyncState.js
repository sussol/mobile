/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SyncIcon } from './SyncIcon';
import { syncStrings } from '../localization';
import { formatDate } from '../utilities';

import globalStyles, {
  GREY,
  DARK_GREY,
} from '../globalStyles';

const ACTIVE_COLOR = DARK_GREY;
const INACTIVE_COLOR = GREY;

export function SyncState(props) {
  let text = syncStrings.sync_enabled;
  let cloudColor = ACTIVE_COLOR;
  let arrowsColor = ACTIVE_COLOR;
  let wifiColor = ACTIVE_COLOR;

  const { lastSyncTime, isSyncing, errorMessage } = props.state;

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
    <View style={[globalStyles.navBarRightContainer, props.style]}>
      {props.showText && <Text style={[globalStyles.navBarText, localStyles.text]}>{text}</Text>}
      <SyncIcon cloudColor={cloudColor} arrowsColor={arrowsColor} wifiColor={wifiColor} />
    </View>
  );
}

SyncState.propTypes = {
  state: PropTypes.object.isRequired,
  showText: PropTypes.bool,
  style: View.propTypes.style,
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
