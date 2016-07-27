/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Image,
  View,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard'; // eslint-disable-line import/no-unresolved

import globalStyles, { BACKGROUND_COLOR } from './globalStyles';

import { Navigator } from './navigation';

import { PAGES, FINALISABLE_PAGES } from './pages';

import {
  FinaliseButton,
  FinaliseModal,
  LoginModal,
  SyncState,
} from './widgets';

import { Synchronizer } from './sync';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema, UIDatabase } from './database';
import { Scheduler } from './Scheduler';
import { Settings } from './settings';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export default class mSupplyMobileApp extends React.Component {

  constructor() {
    super();
    const database = new Database(schema);
    this.database = new UIDatabase(database);
    this.settings = new Settings(this.database);
    this.userAuthenticator = new UserAuthenticator(this.database, this.settings);
    const syncAuthenticator = new SyncAuthenticator(this.database, this.settings);
    this.synchronizer = new Synchronizer(database, syncAuthenticator, this.settings);
    this.scheduler = new Scheduler();
    const initialised = this.synchronizer.isInitialised();
    this.state = {
      confirmFinalise: false,
      currentUser: null,
      initialised: initialised,
      isSyncing: false,
      syncError: '',
      lastSync: null, // Date of the last successful sync
      finaliseItem: null,
    };
  }

  componentWillMount() {
    this.logOut = this.logOut.bind(this);
    this.onAuthentication = this.onAuthentication.bind(this);
    this.onInitialised = this.onInitialised.bind(this);
    this.renderFinaliseButton = this.renderFinaliseButton.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderSyncState = this.renderSyncState.bind(this);
    this.synchronize = this.synchronize.bind(this);
    this.scheduler.schedule(this.synchronize,
                            SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      if (this.state.currentUser !== null) { // Only reauthenticate if currently logged in
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);
  }

  componentWillUnmount() {
    this.scheduler.clearAll();
  }

  onAuthentication(user) {
    this.setState({ currentUser: user });
  }

  onInitialised() {
    this.setState({ initialised: true });
  }

  async synchronize() {
    if (!this.state.initialised || this.state.isSyncing) return; // If already syncing, skip
    try {
      this.setState({ isSyncing: true });
      await this.synchronizer.synchronize();
      this.setState({
        isSyncing: false,
        syncError: '',
      });
    } catch (error) {
      this.setState({
        isSyncing: false,
        syncError: error.message,
      });
    }
  }

  logOut() {
    this.setState({ currentUser: null });
  }

  renderFinaliseButton() {
    return (
      <FinaliseButton
        isFinalised={this.state.finaliseItem.record.status === 'finalised'}
        onPress={() => this.setState({ confirmFinalise: true })}
      />);
  }

  renderLogo() {
    return (
      <Image
        resizeMode="contain"
        source={require('./images/logo.png')}
      />
    );
  }

  renderScene(props) {
    const navigateTo = (key, title, extraProps, navType) => {
      dismissKeyboard();
      if (!navType) navType = 'push';
      const navigationProps = { key, title, ...extraProps };
      // If the page we're going to has a key value pair in FINALISABLE_PAGES, get the finaliseItem
      // details corresponding to that key. Set the new state and render the finalise Button
      if (FINALISABLE_PAGES[key]) {
        const { recordToFinaliseKey, ...finaliseItem } = FINALISABLE_PAGES[key];
        finaliseItem.record = extraProps[recordToFinaliseKey];
        this.setState({ finaliseItem: finaliseItem });
        navigationProps.renderRightComponent = this.renderFinaliseButton;
      }

      // Now navigate to the page, passing on any extra props and the finalise button if required
      props.onNavigate({ type: navType, ...navigationProps });
    };
    const { key, ...extraProps } = props.scene.route;
    const Page = PAGES[key]; // Get the page the navigation key relates to
    // Return the requested page with any extra props passed to navigateTo in pageProps
    return (
      <Page
        navigateTo={navigateTo}
        database={this.database}
        settings={this.settings}
        logOut={this.logOut}
        currentUser={this.state.currentUser}
        {...extraProps}
      />);
  }

  renderSyncState() {
    return (
      <SyncState
        isSyncing={this.state.isSyncing}
        syncError={this.state.syncError}
        settings={this.settings}
      />
    );
  }

  render() {
    if (!this.state.initialised) {
      const FirstUsePage = PAGES.firstUse;
      return (
        <FirstUsePage
          synchronizer={this.synchronizer}
          onInitialised={this.onInitialised}
        />
      );
    }
    return (
      <View style={globalStyles.appBackground}>
        <Navigator
          renderScene={this.renderScene}
          renderCentreComponent={this.renderLogo}
          renderRightComponent={this.renderSyncState}
          navBarStyle={globalStyles.navBarStyle}
          backgroundColor={BACKGROUND_COLOR}
        />
        <FinaliseModal
          database={this.database}
          isOpen={this.state.confirmFinalise}
          onClose={() => this.setState({ confirmFinalise: false })}
          finaliseItem={this.state.finaliseItem}
          user={this.state.currentUser}
        />
        <LoginModal
          authenticator={this.userAuthenticator}
          isAuthenticated={this.state.currentUser !== null}
          onAuthentication={this.onAuthentication}
        />
      </View>
    );
  }
}
