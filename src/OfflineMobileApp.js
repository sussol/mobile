/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  Image,
  Text,
  View,
} from 'react-native';

import globalStyles, { BACKGROUND_COLOR } from './globalStyles';

import { Navigator } from './navigation';

import { PAGES } from './pages';

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
    const navigateTo = (key, title, extraProps) => {
      props.onNavigate({ type: 'push', key, title, ...extraProps });
    };
    const { key, ...extraProps } = props.scene.navigationState;
    const Page = PAGES[key]; // Get the page the navigation key relates to
    // Return the requested page with any extra props passed to navigateTo in pageProps
    return (
      <Page
        navigateTo={navigateTo}
        database={this.database}
        logOut={this.logOut}
        {...extraProps}
      />);
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

  renderLogo() {
    return (
      <Image
        resizeMode="contain"
        source={require('./images/logo.png')}
      />
    );
  }

  render() {
    if (!this.state.initialised) {
      const FirstUsePage = PAGES['firstUse'];
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
        <LoginModal
          authenticator={this.userAuthenticator}
          isAuthenticated={this.state.authenticated}
          onAuthentication={this.onAuthentication}
        />
      </View>
    );
  }
}
