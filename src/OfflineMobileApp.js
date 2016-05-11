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

import { Button, LoginModal } from './widgets';

import { Synchronizer } from './sync';
import { UserAuthenticator } from './authentication';
import realm from './database/realm';
import Scheduler from './Scheduler';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.authenticator = new UserAuthenticator(realm);
    this.synchronizer = new Synchronizer(realm);
    this.scheduler = new Scheduler();
    const initialised = this.synchronizer.isInitialised();
    this.state = {
      initialised: initialised,
      authenticated: false,
    };
  }

  componentWillMount() {
    this.renderScene = this.renderScene.bind(this);
    this.renderLogoutButton = this.renderLogoutButton.bind(this);
    this.scheduler.schedule(this.synchronizer.synchronize, SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      this.authenticator.reauthenticate((authenticated) => {
        this.setState({ authenticated: authenticated });
      });
    },
      AUTHENTICATION_INTERVAL);
  }

  componentWillUnmount() {
    this.scheduler.clearAll();
  }

  renderLogoutButton() {
    return (
      <Button
        text="Logout"
        onPress={() => this.setState({ authenticated: false })}
      />);
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
    if (!this.state.initialised) {
      return (
        <FirstUsePage
          database={realm}
          onInitialise={(serverURL, syncSiteName, syncSitePassword) => {
            this.synchronizer.initialise(serverURL,
                                         syncSiteName,
                                         syncSitePassword,
                                         () => this.setState({ initialised: true }));
          }}
        />
      );
    }
    return (
      <View style={styles.container}>
        <Navigator
          renderScene={this.renderScene}
          renderRightComponent={this.renderLogoutButton}
        />
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
