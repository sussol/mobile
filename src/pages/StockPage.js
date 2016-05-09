/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  View,
} from 'react-native';

import Catalogue from './Catalogue';
import globalStyles from '../styles';

export default function StockPage(props) {
  return <Catalogue database={props.database} />;
}

StockPage.propTypes = {
  database: React.PropTypes.object,
  style: View.propTypes.style,
};
