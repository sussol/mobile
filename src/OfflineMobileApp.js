/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
} from 'react-native';

import {
  CustomerInvoicesPage,
  MenuPage,
  SupplierInvoicesPage,
  StockPage,
  StocktakeEditor,
  StocktakeManager,
  StocktakesPage,
} from './pages';

import Synchronizer from './sync/Synchronizer';

import {
  Router,
  Scene,
} from 'react-native-router-flux';

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.synchronizer = new Synchronizer();
    this.synchronizer.synchronize();
  }

  render() {
    return (
      <Router>
        <Scene
          key="menu"
          initial
          hideNavBar
          component={MenuPage}
        />
        <Scene
          key="stock"
          component={StockPage}
          title="Stock"
          sceneStyle={styles.navBarOffset}
        />
        <Scene
          key="stocktakes"
          component={StocktakesPage}
          title="Stocktakes"
          sceneStyle={styles.navBarOffset}
        />
        <Scene
          key="stocktakeEditor"
          component={StocktakeEditor}
          title="Stocktake"
          sceneStyle={styles.navBarOffset}
        />
        <Scene
          key="stocktakeManager"
          component={StocktakeManager}
          sceneStyle={styles.navBarOffset}
        />
        <Scene
          key="customerInvoices"
          component={CustomerInvoicesPage}
          title="Customer Invoices"
          sceneStyle={styles.navBarOffset}
        />
        <Scene
          key="supplierInvoices"
          component={SupplierInvoicesPage}
          title="Supplier Invoices"
          sceneStyle={styles.navBarOffset}
        />
      </Router>
    );
  }
}

const styles = StyleSheet.create({
  navBarOffset: {
    paddingTop: 68,
  },
});
