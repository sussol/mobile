/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  Navigator,
  StyleSheet,
} from 'react-native';

import { CustomerInvoicesPage } from './pages/CustomerInvoicesPage';
import { MenuPage } from './pages/MenuPage';
import { OrdersPage } from './pages/OrdersPage';
import { StockPage } from './pages/StockPage';
import { StocktakesPage } from './pages/StocktakesPage';
import Synchronizer from './sync/Synchronizer';

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.synchronizer = new Synchronizer();
    this.synchronizer.synchronize();
  }

  _renderScene(route, nav) {
    switch (route.id) {
      case 'stock':
        return <StockPage />;
      case 'stocktakes':
        return <StocktakesPage />;
      case 'customerInvoices':
        return <CustomerInvoicesPage />;
      case 'orders':
        return <OrdersPage />;
      default:
        return <MenuPage navigator={nav} />;
    }
  }

  render() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={{ id: 'menuPage' }}
        renderScene={this._renderScene}
        configureScene={() => Navigator.SceneConfigs.FloatFromRight}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});
