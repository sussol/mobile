/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  Text,
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

import { LoginModal } from './widgets';

import { Synchronizer } from './sync';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema } from './database';
import { Scheduler } from './Scheduler';
import { Settings } from './settings';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const SYNC_STATES = {
  WAITING: 'sync_waiting',
  SYNCING: 'sync_active',
  ERROR: 'sync_error',
};

export default class OfflineMobileApp extends React.Component {

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
      syncState: SYNC_STATES.WAITING,
      syncError: '',

    };
  }

  componentWillMount() {
    this.logOut = this.logOut.bind(this);
    this.onAuthentication = this.onAuthentication.bind(this);
    this.onInitialised = this.onInitialised.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderSyncState = this.renderSyncState.bind(this);
    this.synchronize = this.synchronize.bind(this);
    this.scheduler.schedule(this.synchronize,
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

  async synchronize() {
    if (this.state.syncState === SYNC_STATES.SYNCING) return; // If already syncing, skip
    try {
      this.setState({ syncState: SYNC_STATES.SYNCING });
      await this.synchronizer.synchronize();
      this.setState({ syncState: SYNC_STATES.WAITING });
    } catch (error) {
      this.setState({
        syncState: SYNC_STATES.ERROR,
        syncError: error.message,
      });
    }
  }

  logOut() {
    this.setState({ authenticated: false });
  }

  renderScene(props) {
    const navigateTo = (key, title) => {
      props.onNavigate({ type: 'push', key, title });
    };
    switch (props.scene.navigationState.key) {
      case 'menu':
      case 'root':
      default:
        return <MenuPage logOut={() => this.logOut} navigateTo={navigateTo} />;
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
        return <SupplierInvoicesPage database={this.database} navigateTo={navigateTo} />;
      case 'supplierInvoice':
        return <SupplierInvoicePage navigateTo={navigateTo} />;
      case 'stockHistories':
        return <StockHistoriesPage navigateTo={navigateTo} />;
      case 'stockHistory':
        return <StockHistoryPage navigateTo={navigateTo} />;
      case 'realmExplorer':
        return <RealmExplorer navigateTo={navigateTo} database={this.database} />;
    }
  }

  renderSyncState() {
    let syncText = this.state.syncState;
    if (syncText === SYNC_STATES.ERROR) syncText = this.state.syncError;
    return (
      <Text>
        {syncText}
      </Text>
    );
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
          renderRightComponent={this.renderSyncState}
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
