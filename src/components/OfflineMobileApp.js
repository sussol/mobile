/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  Navigator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { MenuPage } from './MenuPage';
import { OrdersPage } from './OrdersPage';
import { StockPage } from './StockPage';
import { StocktakesPage } from './StocktakesPage';
import Synchronizer from '../reducers/Synchronizer';

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.synchronizer = new Synchronizer();
    this.synchronizer.synchronize();
  }

  _renderScene(route, nav) {
    switch (route.id) {
      case 'stock':
        return <StockPage />
      case 'stocktakes':
        return <StocktakesPage />
      case 'customerInvoices':
        return <CustomerInvoicesPage />
      case 'orders':
        return <OrdersPage />
      default:
        return <MenuPage navigator={nav} />
    }
  }

  render() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={{id: 'menuPage'}}
        renderScene={this._renderScene}
        configureScene={(route) => Navigator.SceneConfigs.FloatFromRight}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  }
});
