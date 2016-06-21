import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SyncIcon } from './SyncIcon';

import { SETTINGS_KEYS as SETTINGS } from '../settings';

import {
  APP_FONT_FAMILY,
  GREY,
  DARK_GREY,
} from '../globalStyles';

const ACTIVE_COLOR = DARK_GREY;
const INACTIVE_COLOR = GREY;

const FONT_SIZE = 10;

export function SyncState(props) {
  let text = 'SYNC ENABLED';
  let cloudColor = ACTIVE_COLOR;
  let arrowsColor = ACTIVE_COLOR;
  let wifiColor = ACTIVE_COLOR;

  if (props.syncError && props.syncError.length > 0) {
    const lastSync = props.settings.get(SETTINGS.SYNC_LAST_SUCCESS);
    text = 'SYNC ERROR.';
    if (lastSync) text = `${text} LAST SYNC ${lastSync.toDateString()}`;
    cloudColor = INACTIVE_COLOR;
    arrowsColor = INACTIVE_COLOR;
    wifiColor = INACTIVE_COLOR;
  } else if (props.isSyncing) {
    text = 'SYNC IN PROGRESS';
  }

  return (
    <View style={localStyles.horizontalContainer}>
      <Text style={localStyles.text}>{text}</Text>
      <SyncIcon cloudColor={cloudColor} arrowsColor={arrowsColor} wifiColor={wifiColor} />
    </View>
  );
}

SyncState.propTypes = {
  isSyncing: React.PropTypes.bool.isRequired,
  syncError: React.PropTypes.string,
  settings: React.PropTypes.object.isRequired,
};

const localStyles = StyleSheet.create({
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    bottom: 6,
  },
  iconActive: {
    color: DARK_GREY,
  },
  iconInactive: {
    color: GREY,
  },
  text: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: FONT_SIZE,
    color: GREY,
    alignSelf: 'flex-end',
    marginRight: 15,
  },
});
