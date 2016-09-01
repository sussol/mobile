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

import globalStyles, { BACKGROUND_COLOR, SUSSOL_ORANGE } from './globalStyles';

import { Navigator } from './navigation';
import { Spinner } from './widgets/Spinner';
import { PAGES, FINALISABLE_PAGES } from './pages';

import {
  FinaliseButton,
  FinaliseModal,
  LoginModal,
  SyncState,
} from './widgets';

import { Synchroniser } from './sync';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema, UIDatabase } from './database';
import { Scheduler } from './Scheduler';
import { MobileAppSettings } from './settings';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export default class mSupplyMobileApp extends React.Component {

  constructor() {
    super();
    const database = new Database(schema);
    this.database = new UIDatabase(database);
    this.settings = new MobileAppSettings(this.database);
    this.userAuthenticator = new UserAuthenticator(this.database, this.settings);
    const syncAuthenticator = new SyncAuthenticator(this.database, this.settings);
    this.synchroniser = new Synchroniser(database, syncAuthenticator, this.settings);
    this.scheduler = new Scheduler();
    const initialised = this.synchroniser.isInitialised();
    this.state = {
      confirmFinalise: false,
      currentUser: null,
      initialised: initialised,
      isSyncing: false,
      syncError: '',
      lastSync: null, // Date of the last successful sync
      finaliseItem: null,
      isLoading: false,
    };
  }

  componentWillMount() {
    this.logOut = this.logOut.bind(this);
    this.onAuthentication = this.onAuthentication.bind(this);
    this.onInitialised = this.onInitialised.bind(this);
    this.runWithLoadingIndicator = this.runWithLoadingIndicator.bind(this);
    this.renderFinaliseButton = this.renderFinaliseButton.bind(this);
    this.renderLoadingIndicator = this.renderLoadingIndicator.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.renderSyncState = this.renderSyncState.bind(this);
    this.synchronise = this.synchronise.bind(this);
    this.scheduler.schedule(this.synchronise,
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

  async runWithLoadingIndicator(functionToRun) {
    // We here set up an asyncronous promise that will be resolved after a timeout
    // of 1 millisecond. This allows a fraction of a delay during which the javascript
    // thread unblocks and allows our spinner animation to start up. We cannot simply
    // call the functionToRun inside a setTimeout as that relegates to a lower
    // priority and results in very slow performance.
    await new Promise((resolve) => {
      this.setState({ isLoading: true }, () => setTimeout(resolve, 1));
    });
    functionToRun();
    this.setState({ isLoading: false });
  }

  async synchronise() {
    if (!this.state.initialised || this.state.isSyncing) return; // If already syncing, skip
    try {
      this.setState({ isSyncing: true });
      await this.synchroniser.synchronise();
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

  renderLoadingIndicator() {
    return (
      <View style={globalStyles.loadingIndicatorContainer}>
        <Spinner isSpinning={this.state.isLoading} color={SUSSOL_ORANGE} />
      </View>);
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
        runWithLoadingIndicator={this.runWithLoadingIndicator}
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
          synchroniser={this.synchroniser}
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
          runWithLoadingIndicator={this.runWithLoadingIndicator}
        />
        <LoginModal
          authenticator={this.userAuthenticator}
          settings={this.settings}
          isAuthenticated={this.state.currentUser !== null}
          onAuthentication={this.onAuthentication}
        />
        {this.state.isLoading && this.renderLoadingIndicator()}
      </View>
    );
  }
}
