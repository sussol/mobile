/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  View,
} from 'react-native';

import { Navigator } from './navigation';

import {
  CustomerInvoicePage,
  CustomerInvoicesPage,
  CustomerPage,
  CustomersPage,
  FirstUsePage,
  MenuPage,
  StockHistoriesPage,
  StockHistoryPage,
  StockPage,
  StocktakeEditPage,
  StocktakeManagePage,
  StocktakesPage,
  SupplierInvoicePage,
  SupplierInvoicesPage,
} from './pages';

import { LoginModal } from './widgets';

import Synchronizer from './sync/Synchronizer';
import { UserAuthenticator } from './authentication';
import realm from './database/realm';

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.synchronizer = new Synchronizer();
    this.authenticator = new UserAuthenticator(realm);
    const initialised = realm.objects('Setting').filtered('key = "ServerURL"').length > 0;
    this.state = {
      initialised: initialised,
      authenticated: false,
    };
  }

  componentWillMount() {
    this.synchronizer.synchronize();
    this.renderScene = this.renderScene.bind(this);
  }

  renderScene(props) {
    const navigateTo = (key, title) => {
      props.onNavigate({ type: 'push', key, title });
    };
    switch (props.scene.navigationState.key) {
      case 'menu':
        return <MenuPage navigateTo={navigateTo} />;
      case 'customers':
        return <CustomersPage navigateTo={navigateTo} />;
      case 'customer':
        return <CustomerPage navigateTo={navigateTo} />;
      case 'stock':
        return <StockPage database={realm} navigateTo={navigateTo} />;
      case 'stocktakes':
        return <StocktakesPage database={realm} navigateTo={navigateTo} />;
      case 'stocktakeEditor':
        return <StocktakeEditPage navigateTo={navigateTo} />;
      case 'stocktakeManager':
        return <StocktakeManagePage navigateTo={navigateTo} />;
      case 'customerInvoices':
        return <CustomerInvoicesPage database={realm} navigateTo={navigateTo} />;
      case 'customerInvoice':
        return <CustomerInvoicePage navigateTo={navigateTo} />;
      case 'supplierInvoices':
        return <SupplierInvoicesPage navigateTo={navigateTo} />;
      case 'supplierInvoice':
        return <SupplierInvoicePage navigateTo={navigateTo} />;
      case 'stockHistories':
        return <StockHistoriesPage navigateTo={navigateTo} />;
      case 'stockHistory':
        return <StockHistoryPage navigateTo={navigateTo} />;
      case 'root':
      default:
        return <MenuPage navigateTo={navigateTo} />;
    }
  }

  render() {
    // if (!this.state.initialised) {
    //   return (
    //     <FirstUsePage
    //       database={realm}
    //       onInitialised={() => this.setState({ initialised: true })}
    //     />
    //   );
    // }
    return (
      <View style={styles.container}>
        <Navigator renderScene={this.renderScene} />
        <LoginModal
          authenticator={this.authenticator}
          isAuthenticated={this.state.authenticated}
          onAuthentication={() => this.setState({ authenticated: true })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
