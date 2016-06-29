/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';

export function RequisitionPage(props) {
  return (
    <View style={props.style}>
      <Text>You can interact with a Stock History.</Text>
    </View>
  );
}

RequisitionPage.propTypes = {
  style: View.propTypes.style,
  navigateTo: React.PropTypes.func.isRequired,
};
