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

import { CustomerInvoicesPage } from './src/components/CustomerInvoicesPage';
import { MenuPage } from './src/components/MenuPage';
import { OrdersPage } from './src/components/OrdersPage';
import { StockPage } from './src/components/StockPage';
import { StocktakesPage } from './src/components/StocktakesPage';
import Synchronizer from './src/components/Synchronizer';

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
