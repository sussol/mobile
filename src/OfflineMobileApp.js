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
import realm from './database/realm';

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.synchronizer = new Synchronizer();
    this.synchronizer.synchronize();
  }

  _renderScene(route, nav) {
    switch (route.id) {
      case 'stock':
        return <StockPage database={realm} />;
      case 'stocktakes':
        return <StocktakesPage database={realm} />;
      case 'customerInvoices':
        return <CustomerInvoicesPage database={realm} />;
      case 'orders':
        return <OrdersPage database={realm} />;
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
