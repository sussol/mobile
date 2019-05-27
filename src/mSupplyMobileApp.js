/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable global-require */

import React from 'react';
import PropTypes from 'prop-types';

import { addNavigationHelpers } from 'react-navigation';
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

import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema, UIDatabase } from './database';
import { migrateDataToVersion } from './dataMigration';
import { Navigator, getCurrentParams, getCurrentRouteName } from './navigation';
import { FirstUsePage, FINALISABLE_PAGES } from './pages';
import { MobileAppSettings } from './settings';
import { Synchroniser, PostSyncProcessor, SyncModal } from './sync';
import {
  FinaliseButton,
  FinaliseModal,
  LoginModal,
  NavigationBar,
  SyncState,
  Spinner,
} from './widgets';

import globalStyles, {
  dataTableColors,
  dataTableStyles,
  pageStyles,
  textStyles,
  SUSSOL_ORANGE,
} from './globalStyles';

import * as sensorSyncMethods from './utilities/modules/temperatureSensorHelpers';

const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.

class MSupplyMobileAppContainer extends React.Component {
  constructor(props, ...otherArgs) {
    super(props, ...otherArgs);
    const database = new Database(schema);
    this.database = new UIDatabase(database);
    this.settings = new MobileAppSettings(this.database);
    migrateDataToVersion(this.database, this.settings);
    this.userAuthenticator = new UserAuthenticator(this.database, this.settings);
    const syncAuthenticator = new SyncAuthenticator(this.settings);
    this.synchroniser = new Synchroniser(
      database,
      syncAuthenticator,
      this.settings,
      props.dispatch
    );
    this.postSyncProcessor = new PostSyncProcessor(this.database, this.settings);
    this.scheduler = new Scheduler();
    const isInitialised = this.synchroniser.isInitialised();
    this.scheduler.schedule(this.synchronise, SYNC_INTERVAL);
    // this.scheduler.schedule(this.synchroniseSensor, SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      const { currentUser } = this.state;
      if (currentUser !== null) {
        // Only reauthenticate if currently logged in.
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);

    const latestTemperatureSync = database.objects('SensorLog').max('timestamp');
    this.state = {
      confirmFinalise: false,
      currentUser: null,
      isInitialised,
      isLoading: false,
      syncModalIsOpen: false,
      temperatureSyncState: {
        message: 'Temperature Sync Details',
        lastSync: latestTemperatureSync,
        isSyncing: false,
        progress: 1,
        total: 1,
      },
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
    return this.navigator && navigationState.index !== 0;
  };

  handleBackEvent = () => {
    const { confirmFinalise, syncModalIsOpen } = this.state;
    // If finalise or sync modals are open, close them rather than navigating.
    if (confirmFinalise || syncModalIsOpen) {
      this.setState({ confirmFinalise: false, syncModalIsOpen: false });
      return true;
    }
    // If we are on base screen (e.g. home), back button should close app as we can't go back.
    if (!this.getCanNavigateBack()) BackHandler.exitApp();
    else {
      const { navigation } = this.navigator.props;
      navigation.goBack();
    }
    return true;
  };

  runWithLoadingIndicator = async (functionToRun, isAsync = false) => {
    this.database.isLoading = true;
    // We here set up an asyncronous promise that will be resolved after a timeout
    // of 1 millisecond. This allows a fraction of a delay during which the javascript
    // thread unblocks and allows our spinner animation to start up. We cannot simply
    // call the functionToRun inside a setTimeout as that relegates to a lower
    // priority and results in very slow performance.
    await new Promise(resolve => {
      this.setState({ isLoading: true }, () => setTimeout(resolve, 1));
    });
    if (isAsync) await functionToRun();
    else functionToRun();
    this.setState({ isLoading: false });
    this.database.isLoading = false;
  };

  syncSensor = async sensor => {
    const { database } = this;
    const params = { sensor, database };
    const updateMessageSyncState = ({ message, lastSync, total = 100, progress = 100 }) => {
      // eslint-disable-next-line react/destructuring-assignment, prefer-destructuring
      if (!lastSync) lastSync = this.state.temperatureSyncState.lastSync;
      this.setState({
        temperatureSyncState: {
          ...this.state.temperatureSyncState, // eslint-disable-line react/no-access-state-in-setstate, react/destructuring-assignment, max-len
          message,
          lastSync,
          isSyncing: progress < 100,
          total,
          progress,
        },
      });
    };
    let result = null;
    // TODO move all of this out and into redux (similar to normal sync)
    // Sync
    updateMessageSyncState({ message: 'Searching for sensor', progress: 0 });
    result = await sensorSyncMethods.findAndUpdateSensor(params);
    console.log(result, sensor.macAddress);
    if (!result.success) {
      updateMessageSyncState({ message: 'Cannot find sensor in proximity' });
      return;
    }
    updateMessageSyncState({
      message: `Syncing logs: ${sensor.numberOfLogs}`,
      progress: 10,
    });
    result = await sensorSyncMethods.syncSensorLogs(params);
    console.log(result);
    if (!result.success) {
      updateMessageSyncState({ message: 'Failed to sync temperature data' });
      return;
    }
    // Aggregation
    const lastSync = database.objects('SensorLog').max('timestamp');
    updateMessageSyncState({ lastSync, message: 'Pre aggregating Logs', progress: 40 });
    result = await sensorSyncMethods.preAggregateLogs(params);
    console.log(result);
    if (!result.success) {
      updateMessageSyncState({
        message: 'Temperature sync successfull, but failure during aggregation',
        progress: 45,
      });
      return;
    }
    updateMessageSyncState({ message: 'Searching for breaches', progress: 50 });
    result = await sensorSyncMethods.applyBreaches(params);
    console.log(result);
    if (!result.success) {
      updateMessageSyncState({
        message: 'Temperature sync successfull, but failed to search for breaches',
      });
      return;
    }
    result = await sensorSyncMethods.addHeadAndTrailingLogToBreach(params);
    console.log(result);
    if (!result.success) {
      updateMessageSyncState({
        message: 'Temperature sync successfull, but failed to search for breaches',
      });
      return;
    }
    updateMessageSyncState({ message: 'Finalising aggregation', progress: 55 });
    result = await sensorSyncMethods.doFullAggregation(params);
    console.log(result);
    // Reconfiguring sensor
    if (!result.success) {
      updateMessageSyncState({
        message: 'Temperature sync successfull, but failed finalise aggregation',
      });
      return;
    }
    updateMessageSyncState({ message: 'Resetting Sensor', progress: 60 });
    result = await sensorSyncMethods.resetSensorInterval(params);
    console.log(result);
    if (!result.success) {
      updateMessageSyncState({ message: 'Sync successfull, but failed to reset sensor' });
      return;
    }
    updateMessageSyncState({ message: 'Reconfiguring sensor', progress: 80 });
    console.log(result);
    result = await sensorSyncMethods.resetSensorAdvertismentFrequency(params);
    if (!result.success) {
      updateMessageSyncState({
        message: 'Temperature sync successfull, but failed to reconfigure sensor',
      });
      return;
    }
    updateMessageSyncState({ message: 'Full temperature sync successfull' });
  };

  synchroniseSensors = async () => {
    const linkedSensors = this.database.objects('Sensor').filtered('location != null');
    for (let i = 0; i < linkedSensors.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.syncSensor(linkedSensors[i]);
      console.log(result);
    }
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
      temperatureSyncState,
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
          onPressBack={this.getCanNavigateBack() ? this.handleBackEvent : null}
          LeftComponent={this.getCanNavigateBack() ? this.renderPageTitle : null}
          CentreComponent={this.renderLogo}
          RightComponent={finaliseItem ? this.renderFinaliseButton : this.renderSyncState}
        />
        <Navigator
          ref={navigator => {
            this.navigator = navigator;
          }}
          navigation={addNavigationHelpers({
            dispatch,
            state: navigationState,
          })}
          screenProps={{
            database: this.database,
            settings: this.settings,
            logOut: this.logOut,
            currentUser,
            runWithLoadingIndicator: this.runWithLoadingIndicator,
            isInAdminMode,
            genericTablePageStyles: {
              searchBarColor: SUSSOL_ORANGE,
              dataTableStyles,
              pageStyles,
              colors: dataTableColors,
            },
            navigateBack: this.getCanNavigateBack() ? this.handleBackEvent : null,
          }}
        />
        <FinaliseModal
          database={this.database}
          isOpen={confirmFinalise}
          onClose={() => this.setState({ confirmFinalise: false })}
          finaliseItem={finaliseItem}
          user={currentUser}
          runWithLoadingIndicator={this.runWithLoadingIndicator}
        />
        <SyncModal
          database={this.database}
          isOpen={syncModalIsOpen}
          state={syncState}
          temperatureSyncState={temperatureSyncState}
          onPressManualSync={this.synchronise}
          onPressTemperatureSync={this.synchroniseSensors}
          onClose={() => this.setState({ syncModalIsOpen: false })}
        />
        <LoginModal
          authenticator={this.userAuthenticator}
          settings={this.settings}
          isAuthenticated={currentUser !== null}
          onAuthentication={this.onAuthentication}
        />
        {isLoading && this.renderLoadingIndicator()}
      </View>
    );
  }
}

/* eslint-disable react/require-default-props, react/forbid-prop-types */
MSupplyMobileAppContainer.propTypes = {
  currentTitle: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  finaliseItem: PropTypes.object,
  navigationState: PropTypes.object.isRequired,
  syncState: PropTypes.object.isRequired,
};

function mapStateToProps({ navigation: navigationState, sync: syncState }) {
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
}

export const MSupplyMobileApp = connect(mapStateToProps)(MSupplyMobileAppContainer);

export default MSupplyMobileApp;
