/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  BackHandler,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { addNavigationHelpers } from 'react-navigation';

import globalStyles, {
  dataTableColors,
  dataTableStyles,
  pageStyles,
  SUSSOL_ORANGE,
} from './globalStyles';

import { Navigator } from './navigation';
import { Spinner } from './widgets/Spinner';
import { PAGES } from './pages';

import {
  FinaliseButton,
  FinaliseModal,
  LoginModal,
  SyncState,
} from './widgets';

import { migrateDataToVersion } from './dataMigration';
import { Synchroniser } from './sync';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema, UIDatabase } from './database';
import { Scheduler } from 'sussol-utilities';
import { MobileAppSettings } from './settings';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

class MSupplyMobileAppContainer extends React.Component {

  constructor() {
    super();
    const database = new Database(schema);
    this.database = new UIDatabase(database);
    this.settings = new MobileAppSettings(this.database);
    migrateDataToVersion(this.database, this.settings);
    this.userAuthenticator = new UserAuthenticator(this.database, this.settings);
    const syncAuthenticator = new SyncAuthenticator(this.settings);
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
    this.renderLogo = this.renderLogo.bind(this);
    this.renderSyncState = this.renderSyncState.bind(this);
    this.synchronise = this.synchronise.bind(this);
    this.handleBackEvent = this.handleBackEvent.bind(this);
    this.getCanNavigateBack = this.getCanNavigateBack.bind(this);
    this.scheduler.schedule(this.synchronise,
                            SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      if (this.state.currentUser !== null) { // Only reauthenticate if currently logged in
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackEvent);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackEvent);
    this.scheduler.clearAll();
  }

  onAuthentication(user) {
    this.setState({ currentUser: user });
  }

  onInitialised() {
    this.setState({ initialised: true });
  }

  getCanNavigateBack() {
    const { navigationState } = this.props;
    return navigationState.index !== 0;
  }

  handleBackEvent() {
    const { navigation } = this.navigator.props;
    // If we are on base screen (e.g. home), back button should close app as we can't go back
    if (!this.getCanNavigateBack()) BackHandler.exitApp();
    else navigation.goBack();
    return true;
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
        isFinalised={this.state.finaliseItem.record.isFinalised}
        onPress={() => this.setState({ confirmFinalise: true })}
      />);
  }

  renderLogo() {
    return (
      <TouchableWithoutFeedback
        delayLongPress={3000}
        onLongPress={() => this.setState({ isInAdminMode: !this.state.isInAdminMode })}
      >
        <Image
          resizeMode="contain"
          source={require('./images/logo.png')}
        />
      </TouchableWithoutFeedback>
    );
  }

  renderLoadingIndicator() {
    return (
      <View style={globalStyles.loadingIndicatorContainer}>
        <Spinner isSpinning={this.state.isLoading} color={SUSSOL_ORANGE} />
      </View>);
  }

  renderSyncState() {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row' }}
        disabled={!this.state.isInAdminMode}
        onPress={this.synchronise}
      >
        <SyncState
          isSyncing={this.state.isSyncing}
          syncError={this.state.syncError}
          settings={this.settings}
        />
      </TouchableOpacity>
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
          ref={(navigator) => { this.navigator = navigator; }}
          navigation={addNavigationHelpers({
            dispatch: this.props.dispatch,
            state: this.props.navigationState,
          })}
          screenProps={{
            database: this.database,
            settings: this.settings,
            logOut: this.logOut,
            currentUser: this.state.currentUser,
            runWithLoadingIndicator: this.runWithLoadingIndicator,
            isInAdminMode: this.state.isInAdminMode,
            searchBarColor: SUSSOL_ORANGE,
            dataTableStyles: dataTableStyles,
            pageStyles: pageStyles,
            colors: dataTableColors,
          }}
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

MSupplyMobileAppContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigationState: PropTypes.object.isRequired,
};

function mapStateToProps({ navigation: navigationState }) {
  return { navigationState };
}

export const MSupplyMobileApp = connect(
  mapStateToProps,
)(MSupplyMobileAppContainer);
