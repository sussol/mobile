/* eslint-disable no-undef */
/* eslint-disable no-console */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable global-require */

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import {
  BackHandler,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Scheduler } from 'sussol-utilities';
import { NavigationActions } from 'react-navigation';

import { FirstUsePage, FINALISABLE_PAGES } from './pages';

import { Synchroniser, PostSyncProcessor, SyncModal } from './sync';
import { FinaliseButton, NavigationBar, SyncState, Spinner } from './widgets';
import { FinaliseModal, LoginModal } from './widgets/modals';

import { getCurrentParams, getCurrentRouteName, ReduxNavigator } from './navigation';
import { migrateDataToVersion } from './dataMigration';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import Settings from './settings/MobileAppSettings';
import Database from './database/BaseDatabase';
import { UIDatabase } from './database';

import globalStyles, { textStyles, SUSSOL_ORANGE } from './globalStyles';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.

class MSupplyMobileAppContainer extends React.Component {
  constructor(props, ...otherArgs) {
    super(props, ...otherArgs);

    migrateDataToVersion(UIDatabase, Settings);
    this.userAuthenticator = new UserAuthenticator(UIDatabase, Settings);
    const syncAuthenticator = new SyncAuthenticator(Settings);
    this.synchroniser = new Synchroniser(Database, syncAuthenticator, Settings, props.dispatch);
    this.postSyncProcessor = new PostSyncProcessor(UIDatabase, Settings);
    this.scheduler = new Scheduler();
    const isInitialised = this.synchroniser.isInitialised();
    this.scheduler.schedule(this.synchronise, SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      const { currentUser } = this.state;
      if (currentUser !== null) {
        // Only re-authenticate if currently logged in.
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);
    this.state = {
      confirmFinalise: false,
      currentUser: null,
      isInitialised,
      isLoading: false,
      syncModalIsOpen: false,
    };
  }

  componentDidMount = () => BackHandler.addEventListener('hardwareBackPress', this.handleBackEvent);

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackEvent);
    this.scheduler.clearAll();
  };

  onAuthentication = user => {
    this.setState({ currentUser: user });
    this.postSyncProcessor.setUser(user);
  };

  onInitialised = () => {
    this.setState({ isInitialised: true });
    this.postSyncProcessor.processAnyUnprocessedRecords();
  };

  getCanNavigateBack = () => {
    const { navigationState } = this.props;
    return navigationState.index !== 0;
  };

  // eslint-disable-next-line class-methods-use-this
  getCurrentRouteName(navigationState) {
    if (!navigationState) return null;

    const route = navigationState.routes[navigationState.index];

    // dive into nested navigators
    if (route.routes) return getCurrentRouteName(route);

    return route.routeName;
  }

  handleBackEvent = () => {
    const { dispatch } = this.props;
    const { confirmFinalise, syncModalIsOpen } = this.state;
    // If finalise or sync modals are open, close them rather than navigating.
    if (confirmFinalise || syncModalIsOpen) {
      this.setState({ confirmFinalise: false, syncModalIsOpen: false });
      return true;
    }
    // If we are on base screen (e.g. home), back button should close app as we can't go back.
    if (!this.getCanNavigateBack()) BackHandler.exitApp();
    else dispatch(NavigationActions.back());

    return true;
  };

  runWithLoadingIndicator = async functionToRun => {
    UIDatabase.isLoading = true;
    // We here set up an asynchronous promise that will be resolved after a timeout
    // of 1 millisecond. This allows a fraction of a delay for the javascript thread
    // to unblock and allow the spinner animation to start up. The |functionToRun| should
    // not be run inside a |setTimeout| as that relegates to a lower priority, resulting
    // in very slow performance.
    await new Promise(resolve => {
      this.setState({ isLoading: true }, () => setTimeout(resolve, 1));
    });
    functionToRun();
    this.setState({ isLoading: false });
    UIDatabase.isLoading = false;
  };

  synchronise = async () => {
    const { syncState } = this.props;
    const { isInitialised } = this.state;
    if (!isInitialised || syncState.isSyncing) return; // Ignore if syncing.
    // True if most recent call to |this.synchroniser.synchronise()| failed.
    const lastSyncFailed = this.synchroniser.lastSyncFailed();
    const lastPostSyncProcessingFailed = this.postSyncProcessor.lastPostSyncProcessingFailed();
    await this.synchroniser.synchronise();
    if (lastSyncFailed || lastPostSyncProcessingFailed) {
      // If last sync was interrupted, it did not enter this block. If the app was closed, it did
      // not store the records left in the record queue, so tables should be checked for unprocessed
      // records. If the last processing of the record queue was interrupted by app crash then all
      // records need to be checked.
      this.postSyncProcessor.processAnyUnprocessedRecords();
    } else {
      this.postSyncProcessor.processRecordQueue();
    }
  };

  logOut = () => this.setState({ currentUser: null });

  renderFinaliseButton = () => {
    const { finaliseItem } = this.props;
    return (
      <FinaliseButton
        isFinalised={finaliseItem.record.isFinalised}
        onPress={() => this.setState({ confirmFinalise: true })}
      />
    );
  };

  renderLogo = () => {
    const { isInAdminMode } = this.state;

    return (
      <TouchableWithoutFeedback
        delayLongPress={3000}
        onLongPress={() => this.setState({ isInAdminMode: !isInAdminMode })}
      >
        <Image resizeMode="contain" source={require('./images/logo.png')} />
      </TouchableWithoutFeedback>
    );
  };

  renderLoadingIndicator = () => {
    const { isLoading } = this.state;
    return (
      <View style={globalStyles.loadingIndicatorContainer}>
        <Spinner isSpinning={isLoading} color={SUSSOL_ORANGE} />
      </View>
    );
  };

  renderPageTitle = () => {
    const { currentTitle } = this.props;
    return <Text style={textStyles}>{currentTitle}</Text>;
  };

  renderSyncState = () => {
    const { syncState } = this.props;
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row' }}
        onPress={() => this.setState({ syncModalIsOpen: true })}
      >
        <SyncState state={syncState} />
      </TouchableOpacity>
    );
  };

  render() {
    const { dispatch, finaliseItem, navigationState, syncState } = this.props;
    const {
      confirmFinalise,
      currentUser,
      isInAdminMode,
      isInitialised,
      isLoading,
      syncModalIsOpen,
    } = this.state;

    if (!isInitialised) {
      return (
        <FirstUsePage
          synchroniser={this.synchroniser}
          onInitialised={this.onInitialised}
          syncState={syncState}
        />
      );
    }

    return (
      <View style={globalStyles.appBackground}>
        <NavigationBar
          routeName={this.getCurrentRouteName(navigationState)}
          onPressBack={this.getCanNavigateBack() ? this.handleBackEvent : null}
          LeftComponent={this.getCanNavigateBack() ? this.renderPageTitle : null}
          CentreComponent={this.renderLogo}
          RightComponent={finaliseItem ? this.renderFinaliseButton : this.renderSyncState}
        />
        <ReduxNavigator
          state={navigationState}
          dispatch={dispatch}
          screenProps={{
            database: UIDatabase,
            settings: Settings,
            logOut: this.logOut,
            currentUser,
            routeName: navigationState.routes[navigationState.index].routeName,
            runWithLoadingIndicator: this.runWithLoadingIndicator,
            isInAdminMode,
          }}
        />
        <FinaliseModal
          database={UIDatabase}
          isOpen={confirmFinalise}
          onClose={() => this.setState({ confirmFinalise: false })}
          finaliseItem={finaliseItem}
          user={currentUser}
          runWithLoadingIndicator={this.runWithLoadingIndicator}
        />
        <SyncModal
          database={UIDatabase}
          isOpen={syncModalIsOpen}
          state={syncState}
          onPressManualSync={this.synchronise}
          onClose={() => this.setState({ syncModalIsOpen: false })}
        />
        <LoginModal
          authenticator={this.userAuthenticator}
          settings={Settings}
          isAuthenticated={currentUser !== null}
          onAuthentication={this.onAuthentication}
        />
        {isLoading && this.renderLoadingIndicator()}
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { nav: navigationState, sync: syncState } = state;
  const currentParams = getCurrentParams(navigationState);
  const currentTitle = currentParams && currentParams.title;
  const finaliseItem = FINALISABLE_PAGES[getCurrentRouteName(navigationState)];
  if (finaliseItem && currentParams) {
    finaliseItem.record = currentParams[finaliseItem.recordToFinaliseKey];
  }

  return {
    currentTitle,
    finaliseItem,
    navigationState,
    syncState,
  };
};

/* eslint-disable react/forbid-prop-types, react/require-default-props */
MSupplyMobileAppContainer.propTypes = {
  currentTitle: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  finaliseItem: PropTypes.object,
  navigationState: PropTypes.object.isRequired,
  syncState: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(MSupplyMobileAppContainer);
