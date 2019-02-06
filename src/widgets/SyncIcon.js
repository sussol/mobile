import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View } from 'react-native';
import IoniconIcon from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export function SyncIcon(props) {
  const { size, cloudColor, arrowsColor, wifiColor } = props;

  return (
    <View style={localStyles.horizontalContainer}>
      <IoniconIcon name="md-cloud" size={size * 30} style={{ top: size * 4 }} color={cloudColor} />
      <FontAwesomeIcon
        name="exchange"
        size={size * 16}
        style={localStyles.icon}
        color={arrowsColor}
      />
      <IoniconIcon name="logo-rss" size={size * 22} style={localStyles.icon} color={wifiColor} />
    </View>
  );
}

export default SyncIcon;

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
