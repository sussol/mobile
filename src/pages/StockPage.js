/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  View,
} from 'react-native';

import Catalogue from './Catalogue';

export default function StockPage(props) {
  return (
    <View style={props.style}>
      <Catalogue database={props.database} />
    </View>
  );
}

StockPage.propTypes = {
  database: React.PropTypes.object,
  style: View.propTypes.style,
};
