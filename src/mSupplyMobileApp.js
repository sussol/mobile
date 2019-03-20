/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  BackHandler,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import { addNavigationHelpers } from 'react-navigation';

import globalStyles, {
  dataTableColors,
  dataTableStyles,
  pageStyles,
  textStyles,
  SUSSOL_ORANGE,
} from './globalStyles';

import { Navigator, getCurrentParams, getCurrentRouteName } from './navigation';
import { FirstUsePage, FINALISABLE_PAGES } from './pages';

import {
  FinaliseButton,
  FinaliseModal,
  LoginModal,
  NavigationBar,
  SyncState,
  Spinner,
} from './widgets';

import { migrateDataToVersion } from './dataMigration';
import { Synchroniser, PostSyncProcessor, SyncModal } from './sync';
import { SyncAuthenticator, UserAuthenticator } from './authentication';
import { Database, schema, UIDatabase } from './database';
import { Scheduler } from 'sussol-utilities';
import { MobileAppSettings } from './settings';
import { generateUUID } from 'react-native-database';

const sensorData = [
  { x: '23-01 8am', y: 5 },
  { x: '23-01 8pm', y: 5.5 },
  { x: '24-01 8am', y: 5.3 },
  { x: '24-01 8pm', y: 5.7 },
  { x: '25-01 8am', y: 6.5 },
  { x: '25-01 8pm', y: 8 },
  { x: '26-01 8am', y: 6 },
  { x: '26-01 8pm', y: 5.5 },
  { x: '24-01 8pm', y: 4 },
  { x: '25-01 8am', y: 3 },
  { x: '25-01 8pm', y: 5 },
  { x: '26-01 8am', y: 4.3 },
  { x: '26-01 8pm', y: 4.6 },
  { x: '25-01 8am', y: 6 },
  { x: '25-01 8pm', y: 3 },
  { x: '26-01 8am', y: 6 },
  { x: '26-01 8pm', y: 6.5 },
  { x: '27-01 8am', y: 4 },
  { x: '27-01 8pm', y: 3.9 },
  { x: '26-01 8am', y: 2 },
  { x: '26-01 8am', y: 1 },
  { x: '26-01 8pm', y: 2 },
  { x: '25-01 8am', y: 4.6 },
  { x: '25-01 8pm', y: 5.7 },
  { x: '26-01 8am', y: 6.4 },
  { x: '26-01 8pm', y: 4 },
  { x: '27-01 8am', y: 3.9 },
  { x: '27-01 8pm', y: 5.6 },
  { x: '26-01 8am', y: 5.4 },
  { x: '26-01 8pm', y: 4.4 },
  { x: '27-01 8am', y: 6.4 },
  { x: '27-01 8pm', y: 7.5 },
  { x: '28-01 8am', y: 5 },
  { x: '28-01 8pm', y: 4 },
  { x: '26-01 8am', y: 3.4 },
  { x: '26-01 8pm', y: 6 },
  { x: '27-01 8am', y: 3 },
  { x: '27-01 8pm', y: 7.8 },
  { x: '28-01 8am', y: 4.5 },
  { x: '28-01 8pm', y: 5 },
  { x: '26-01 8am', y: 7 },
  { x: '26-01 8pm', y: 5.4 },
  { x: '27-01 8am', y: 3 },
  { x: '27-01 8pm', y: 3.5 },
  { x: '28-01 8am', y: 4.6 },
  { x: '28-01 8pm', y: 5 },
  { x: '28-01 8am', y: 5.2 },
  { x: '28-01 8pm', y: 4.9 },
  { x: '29-01 8am', y: 4.3 },
  { x: '29-01 8pm', y: 5 },
];
const sensorData2 = [
  { x: '23-01 8am', y: 8 },
  { x: '23-01 8pm', y: 5 },
  { x: '24-01 8am', y: 6 },
  { x: '24-01 8pm', y: 7 },
  { x: '25-01 8am', y: 5 },
  { x: '25-01 8pm', y: 8 },
  { x: '26-01 8am', y: 10 },
  { x: '26-01 8pm', y: 10.5 },
  { x: '24-01 8pm', y: 8 },
  { x: '25-01 8am', y: 7 },
  { x: '25-01 8pm', y: 5 },
  { x: '26-01 8am', y: 6 },
  { x: '26-01 8pm', y: 4.5 },
  { x: '25-01 8am', y: 5 },
  { x: '25-01 8pm', y: 7 },
  { x: '26-01 8am', y: 4.5 },
  { x: '26-01 8pm', y: 8 },
  { x: '27-01 8am', y: 9 },
  { x: '27-01 8pm', y: 10 },
  { x: '26-01 8am', y: 8 },
  { x: '26-01 8am', y: 7 },
  { x: '26-01 8pm', y: 6 },
  { x: '25-01 8am', y: 5.6 },
  { x: '25-01 8pm', y: 6.7 },
  { x: '26-01 8am', y: 5.4 },
  { x: '26-01 8pm', y: 4 },
  { x: '27-01 8am', y: 4.9 },
  { x: '27-01 8pm', y: 4.6 },
  { x: '26-01 8am', y: 4.4 },
  { x: '26-01 8pm', y: 6.4 },
  { x: '27-01 8am', y: 5.4 },
  { x: '27-01 8pm', y: 7 },
  { x: '28-01 8am', y: 8 },
  { x: '28-01 8pm', y: 7.5 },
  { x: '26-01 8am', y: 7.7 },
  { x: '26-01 8pm', y: 6 },
  { x: '27-01 8am', y: 7 },
  { x: '27-01 8pm', y: 5 },
  { x: '28-01 8am', y: 4 },
  { x: '28-01 8pm', y: 5.1 },
  { x: '26-01 8am', y: 5 },
  { x: '26-01 8pm', y: 6 },
  { x: '27-01 8am', y: 7 },
  { x: '27-01 8pm', y: 8 },
  { x: '28-01 8am', y: 7 },
  { x: '28-01 8pm', y: 6 },
  { x: '28-01 8am', y: 7 },
  { x: '28-01 8pm', y: 8 },
  { x: '29-01 8am', y: 9 },
  { x: '29-01 8pm', y: 8.6 },
  { x: '28-01 8am', y: 7 },
  { x: '28-01 8pm', y: 6 },
  { x: '28-01 8am', y: 7.6 },
  { x: '28-01 8pm', y: 7.9 },
  { x: '29-01 8am', y: 8 },
  { x: '29-01 8pm', y: 9 },
  { x: '28-01 8am', y: 10 },
  { x: '28-01 8am', y: 8 },
];
const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

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
      props.dispatch,
    );
    this.postSyncProcessor = new PostSyncProcessor(this.database, this.settings);
    this.scheduler = new Scheduler();
    const isInitialised = this.synchroniser.isInitialised();
    this.scheduler.schedule(this.synchronise, SYNC_INTERVAL);
    this.scheduler.schedule(() => {
      if (this.state.currentUser !== null) {
        // Only reauthenticate if currently logged in
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);
    this.state = {
      confirmFinalise: false,
      currentUser: null,
      isInitialised: isInitialised,
      isLoading: false,
      syncModalIsOpen: false,
    };

    const vaccineCategory = this.database.objects('ItemCategory').filtered('name == "Vaccine"');
    console.log('found item category = "Vaccine" ' + vaccineCategory[0].id);
    const items = this.database.objects('Item').filtered('name CONTAINS "vial"');
    console.log('found items name CONTAINS "vial"' + items.length);
    this.database.write(() => {
      items.forEach(item => item.category = vaccineCategory[0]);
    });



    // const addHours = (hours, datetime) => {
    //   const newDatetime = new Date(datetime);
    //   newDatetime.setTime(newDatetime.getTime() + hours * 60 * 60 * 1000);
    //   return newDatetime;
    // };

    // this.database.write(() => {
    //   const allSensorLogs = this.database.objects('SensorLog');

    //   if (allSensorLogs && allSensorLogs.length > 0) this.database.delete('SensorLog', allSensorLogs);

    //   const allSensors = this.database.objects('Sensor');
    //   if (allSensors && allSensors.length > 0) this.database.delete('Sensor', allSensors);

    //   const sensor1 = this.database.create('Sensor', {
    //     id: generateUUID(),
    //     name: 'checkSensor1',
    //     address: 'checkSensor1Address',
    //     latestValue: 5.0,
    //     latestValueTimestamp: new Date(),
    //     latestBatteryLevel: 99,
    //     logInterval: 20,
    //   });

    //   const sensor2 = this.database.create('Sensor', {
    //     id: generateUUID(),
    //     name: 'checkSensor2',
    //     address: 'checkSensor2Address',
    //     latestValue: 9,
    //     latestValueTimestamp: new Date(),
    //     latestBatteryLevel: 99,
    //     logInterval: 20,
    //   });

    //   const fridges = this.database.objects('Location');
    //   fridges[1].sensor = sensor2;
    //   fridges[0].sensor = sensor1;
    //   fridges[0].soh = '$5120';
    //   fridges[1].soh = '$140';
 
    //   const sensor1Data = sensorData;
    //   let dateNow = addHours(24*8*-1, new Date());

    //   for (let i = 0; i < sensor1Data.length; i++) {
    //     dateNow = addHours(3, dateNow);
    //     const sensorLog = this.database.create('SensorLog', {
    //       id: generateUUID(),
    //       timestamp: dateNow,
    //       logCounter: i,
    //       logInterval: 20,
    //       value: sensor1Data[i].y,
    //     });
    //     sensor1.sensorLogs.push(sensorLog);
    //   }

    //   const sensor2Data = sensorData2;
    //   dateNow = addHours(24*8*-1, new Date());
    //   for (let i = 0; i < sensor2Data.length; i++) {
    //     dateNow = addHours(3, dateNow);
    //     const sensorLog = this.database.create('SensorLog', {
    //       id: generateUUID(),
    //       timestamp: dateNow,
    //       logCounter: i,
    //       logInterval: 20,
    //       value: sensor2Data[i].y,
    //     });
    //     sensor2.sensorLogs.push(sensorLog);
    //   }
    // });
    // this.logTesting();
  }
  /// TO BE REMOVED
  // logTesting = () => {
  //   console.log('starting test');
  //   console.log('\n******* empty logs test');
  //   let data = {};

  //   data = {
  //     sensor: {
  //       logInterval: 60,
  //       lastSensorLog: {},
  //     },
  //     logCounter: 3,
  //     currentDate: new Date('2018-01-10T12:00:00'),
  //     temperatureReadings: [
  //       1,2,3
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

  //   console.log('\n******* empty logs test, more records then sent');

  //   data = {
  //     sensor: {
  //       logInterval: 60,
  //       lastSensorLog: {},
  //     },
  //     logCounter: 10,
  //     currentDate: new Date('2018-01-10T12:00:00'),
  //     temperatureReadings: [
  //       1,2,3
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

  //   console.log('\n******* log counter match test');

  //   data = {
  //     sensor: {
  //       logInterval: 60,
  //       lastSensorLog: {
  //         logInterval: 60,
  //         logCounter: 10
  //       },
  //     },
  //     logCounter: 10,
  //     currentDate: new Date('2018-01-10T12:00:00'),
  //     temperatureReadings: [
  //       1,2,3
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

  //   console.log('\n******* addition test, receiving all new records');

  //   data = {
  //     sensor: {
  //       logInterval: 60,
  //       lastSensorLog: {
  //         logInterval: 60,
  //         logCounter: 10,
  //         timestamp: new Date('2018-01-09T12:00:00')
  //       },
  //     },
  //     logCounter: 20,
  //     currentDate: new Date('2018-01-10T12:00:00'),
  //     temperatureReadings: [
  //       1,2,3,4,5,6,7
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

  //   console.log('\n******* addition test, receiving more readings');

  //   data = {
  //     sensor: {
  //       logInterval: 60,
  //       lastSensorLog: {
  //         logInterval: 60,
  //         logCounter: 10,
  //         timestamp: new Date('2018-01-10T12:00:00')
  //       },
  //     },
  //     logCounter: 15,
  //     currentDate: new Date('2018-01-10T12:05:00'),
  //     temperatureReadings: [
  //       10,20,30,40,50,60,70
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

  //   console.log('\n******* addition test, change of log interval');

  //   data = {
  //     sensor: {
  //       logInterval: 10,
  //       lastSensorLog: {
  //         logInterval: 60,
  //         logCounter: 10,
  //         timestamp: new Date('2018-01-10T12:00:00')
  //       },
  //     },
  //     logCounter: 15,
  //     currentDate: new Date('2018-01-10T12:05:00'),
  //     temperatureReadings: [
  //       10,20,30,40,50,60,70
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

  //   console.log('\n******* addition test, change of log interval');

  //   data = {
  //     sensor: {
  //       logInterval: 10,
  //       lastSensorLog: {
  //         logInterval: 60,
  //         logCounter: 10,
  //         timestamp: new Date('2018-01-10T12:00:00')
  //       },
  //     },
  //     logCounter: 15,
  //     currentDate: new Date('2018-01-10T12:01:00'),
  //     temperatureReadings: [
  //       10,20,30,40,50,60,70
  //     ]
  //   }
  //   console.log('params:', data);
  //   console.log('result:', this.calculateNewLogs(data));

    // breakhere;
  // }

  /// END OF - TO BE REMOVED

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
    // If finalise or sync modals are open, close them rather than navigating
    if (confirmFinalise || syncModalIsOpen) {
      this.setState({ confirmFinalise: false, syncModalIsOpen: false });
      return true;
    }
    // If we are on base screen (e.g. home), back button should close app as we can't go back
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

  synchronise = async () => {
    if (!this.state.isInitialised || this.props.syncState.isSyncing) return; // Ignore if syncing
    // True if last this.synchroniser.synchronise() call failed
    const lastSyncFailed = this.synchroniser.lastSyncFailed();
    const lastPostSyncProcessingFailed = this.postSyncProcessor.lastPostSyncProcessingFailed();
    await this.synchroniser.synchronise();
    if (lastSyncFailed || lastPostSyncProcessingFailed) {
      // Last sync was interrupted so would not have entered this if block.
      // If the app was closed, it would have forgotten the records left in the
      // record queue, so we need to check tables for unprocessed records.
      // If the last processing of the record queue was interrupted by app crash
      // then we again need to check all records.
      this.postSyncProcessor.processAnyUnprocessedRecords();
    } else {
      this.postSyncProcessor.processRecordQueue();
    }
  };

  logOut = () => {
    this.setState({ currentUser: null });
  };

  renderFinaliseButton = () => (
    <FinaliseButton
      isFinalised={this.props.finaliseItem.record.isFinalised}
      onPress={() => this.setState({ confirmFinalise: true })}
    />
  );

  renderLogo = () => (
    <TouchableWithoutFeedback
      delayLongPress={3000}
      onLongPress={() => this.setState({ isInAdminMode: !this.state.isInAdminMode })}
    >
      <Image resizeMode="contain" source={require('./images/logo.png')} />
    </TouchableWithoutFeedback>
  );

  renderLoadingIndicator = () => (
    <View style={globalStyles.loadingIndicatorContainer}>
      <Spinner isSpinning={this.state.isLoading} color={SUSSOL_ORANGE} />
    </View>
  );

  renderPageTitle = () => <Text style={textStyles}>{this.props.currentTitle}</Text>;

  renderSyncState = () => (
    <TouchableOpacity
      style={{ flexDirection: 'row' }}
      onPress={() => this.setState({ syncModalIsOpen: true })}
    >
      <SyncState state={this.props.syncState} />
    </TouchableOpacity>
  );

  render() {
    if (!this.state.isInitialised) {
      return (
        <FirstUsePage
          synchroniser={this.synchroniser}
          onInitialised={this.onInitialised}
          syncState={this.props.syncState}
        />
      );
    }
    const { finaliseItem, dispatch, navigationState } = this.props;
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
            currentUser: this.state.currentUser,
            runWithLoadingIndicator: this.runWithLoadingIndicator,
            isInAdminMode: this.state.isInAdminMode,
            genericTablePageStyles: {
              searchBarColor: SUSSOL_ORANGE,
              dataTableStyles,
              pageStyles,
              colors: dataTableColors,
            },
          }}
        />
        <FinaliseModal
          database={this.database}
          isOpen={this.state.confirmFinalise}
          onClose={() => this.setState({ confirmFinalise: false })}
          finaliseItem={finaliseItem}
          user={this.state.currentUser}
          runWithLoadingIndicator={this.runWithLoadingIndicator}
        />
        <SyncModal
          database={this.database}
          isOpen={this.state.syncModalIsOpen}
          state={this.props.syncState}
          onPressManualSync={this.synchronise}
          onClose={() => this.setState({ syncModalIsOpen: false })}
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
