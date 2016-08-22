import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SyncIcon } from './SyncIcon';
import { SETTINGS_KEYS as SETTINGS } from '../settings';
import { navStrings } from '../localization';

import globalStyles, {
  GREY,
  DARK_GREY,
} from '../globalStyles';

const ACTIVE_COLOR = DARK_GREY;
const INACTIVE_COLOR = GREY;

export function SyncState(props) {
  let text = navStrings.sync_enabled;
  let cloudColor = ACTIVE_COLOR;
  let arrowsColor = ACTIVE_COLOR;
  let wifiColor = ACTIVE_COLOR;

  if (props.isSyncing) {
    text = navStrings.sync_in_progress;
  } else if (props.syncError && props.syncError.length > 0) {
    const lastSync = props.settings ? props.settings.get(SETTINGS.SYNC_LAST_SUCCESS) : '';
    text = navStrings.sync_error;
    if (lastSync) text = `${text}. ${navStrings.last_sync} ${lastSync}`;
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
  isSyncing: React.PropTypes.bool.isRequired,
  syncError: React.PropTypes.string,
  settings: React.PropTypes.object,
  showText: React.PropTypes.bool,
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
