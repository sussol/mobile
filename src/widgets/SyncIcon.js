import React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

export function SyncIcon(props) {
  return (
    <View style={localStyles.horizontalContainer}>
      <Icon
        name="md-cloud"
        size={props.size * 30}
        style={{ top: props.size * 4 }}
        color={props.cloudColor}
      />
      <Icon
        name="md-swap"
        size={props.size * 22}
        style={localStyles.icon}
        color={props.arrowsColor}
      />
      <Icon
        name="logo-rss"
        size={props.size * 22}
        style={localStyles.icon}
        color={props.wifiColor}
      />
    </View>
  );
}

SyncIcon.propTypes = {
  cloudColor: React.PropTypes.string,
  arrowsColor: React.PropTypes.string,
  wifiColor: React.PropTypes.string,
  size: React.PropTypes.number,
};

SyncIcon.defaultProps = {
  cloudColor: '#000000',
  arrowsColor: '#000000',
  wifiColor: '#000000',
  size: 1,
};

const localStyles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  icon: {
    marginLeft: 10,
  },
});
