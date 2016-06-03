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
  RealmExplorer,
} from './pages';

import { Button, LoginModal } from './widgets';

import { Synchronizer } from './sync';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema } from './database';
import { Scheduler } from './Scheduler';
import { Settings } from './settings';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export default class OfflineMobileApp extends Component {

  constructor() {
    super();
    this.database = new Database(schema);
    this.settings = new Settings(this.database);
    this.userAuthenticator = new UserAuthenticator(this.database, this.settings);
    const syncAuthenticator = new SyncAuthenticator(this.database, this.settings);
    this.synchronizer = new Synchronizer(this.database, syncAuthenticator, this.settings);
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
    this.onAuthentication = this.onAuthentication.bind(this);
    this.onInitialised = this.onInitialised.bind(this);
    this.scheduler.schedule(this.synchronizer.synchronize,
                            SYNC_INTERVAL);
    this.scheduler.schedule(() => this.userAuthenticator.reauthenticate(this.onAuthentication),
                            AUTHENTICATION_INTERVAL);
  }

  componentWillUnmount() {
    this.scheduler.clearAll();
  }

  onAuthentication(authenticated) {
    this.setState({ authenticated: authenticated });
  }

  onInitialised() {
    this.setState({ initialised: true });
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
        return <CustomersPage database={this.database} navigateTo={navigateTo} />;
      case 'customer':
        return <CustomerPage navigateTo={navigateTo} />;
      case 'stock':
        return <StockPage database={this.database} navigateTo={navigateTo} />;
      case 'stocktakes':
        return <StocktakesPage database={this.database} navigateTo={navigateTo} />;
      case 'stocktakeEditor':
        return <StocktakeEditPage navigateTo={navigateTo} />;
      case 'stocktakeManager':
        return <StocktakeManagePage navigateTo={navigateTo} />;
      case 'customerInvoices':
        return <CustomerInvoicesPage database={this.database} navigateTo={navigateTo} />;
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
      case 'realmExplorer':
        return <RealmExplorer navigateTo={navigateTo} database={this.database} />;
      case 'root':
      default:
        return <MenuPage navigateTo={navigateTo} />;
    }
  }

  render() {
    if (!this.state.initialised) {
      return (
        <FirstUsePage
          synchronizer={this.synchronizer}
          onInitialised={this.onInitialised}
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
          authenticator={this.userAuthenticator}
          isAuthenticated={this.state.authenticated}
          onAuthentication={this.onAuthentication}
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
