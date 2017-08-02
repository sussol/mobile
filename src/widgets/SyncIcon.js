import React from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  View,
} from 'react-native';

import IoniconIcon from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export function SyncIcon(props) {
  return (
    <View style={localStyles.horizontalContainer}>
      <IoniconIcon
        name="md-cloud"
        size={props.size * 30}
        style={{ top: props.size * 4 }}
        color={props.cloudColor}
      />
      <FontAwesomeIcon
        name="exchange"
        size={props.size * 16}
        style={localStyles.icon}
        color={props.arrowsColor}
      />
      <IoniconIcon
        name="logo-rss"
        size={props.size * 22}
        style={localStyles.icon}
        color={props.wifiColor}
      />
    </View>
  );
}

SyncIcon.propTypes = {
  cloudColor: PropTypes.string,
  arrowsColor: PropTypes.string,
  wifiColor: PropTypes.string,
  size: PropTypes.number,
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
