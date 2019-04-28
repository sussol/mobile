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
    this.scheduler.schedule(() => {
      const { currentUser } = this.state;
      if (currentUser !== null) {
        // Only reauthenticate if currently logged in.
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
    // id: 'string',
    // title: { type: 'string', default: 'Placeholder Name' },
    // type: { type: 'string', default: 'Placeholder Type' },
    // isActive: { type: 'bool', default: false },
    this.database.write(() => {
      this.database.update('ItemBatch', {
        id: '99b27c9069b111e988be7f962b86994f',
        batch: 'abhfkjeo',
      });
      this.database.update('Transaction', {
        id: '38ACFD7D319A45FAB7A022709D3C9B11',
        entryDate: new Date(2019, 2, 30),
        confirmDate: new Date(2019, 3, 3),
      });
      this.database.update('Transaction', {
        id: '95d78c5069b111e988be7f962b86994f',
        entryDate: new Date(2019, 2, 30),
        confirmDate: new Date(2019, 3, 3),
      });
      const fridge1 = this.database
        .objects('Location')
        .filtered('id = $0', 'A183F5E649A945F3AC8CE7C598464F8A')[0];
      this.database.update('Sensor', { id: 'senUUID2', location: fridge1, temperature: 5.2 });
      const fridge2 = this.database.objects('Location').filtered('id = $0', 'LOCUUID1')[0];
      this.database.update('Sensor', { id: 'senUUID1', location: fridge2, temperature: 8.9 });
      this.database.update('LocationType', {
        id: '9AD96A8E4D364DDB8E27F38A6096C17D',
        minTemperature: 2,
        maxTemperature: 8,
      });

      let ItemBatches = this.database
        .objects('ItemBatch')
        .filtered('id  = "61059BD30DAE4C5D9F9A31B09266DB2C"');
      const batches = [];

      const sensor1 = this.database.objects('Sensor').filtered('id = $0', 'senUUID2')[0];
      const sensor2 = this.database.objects('Sensor').filtered('id = $0', 'senUUID1')[0];

      const sensor1logs = [
        {
          timestamp: new Date('2019-04-20T12:00:00'),
          temperature: 6.5,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-20T12:00:00'), temperature: 5, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-19T12:00:00'),
          temperature: 6.2,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-19T12:00:00'), temperature: 4, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-18T12:00:00'),
          temperature: 5.2,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-18T12:00:00'),
          temperature: 3.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-17T12:00:00'),
          temperature: 5.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-17T12:00:00'),
          temperature: 4.2,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-16T12:00:00'),
          temperature: 4.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-16T12:00:00'),
          temperature: 2.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-15T12:00:00'),
          temperature: 4.4,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-15T12:00:00'), temperature: 3, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-14T12:00:00'),
          temperature: 3.5,
          batches,
          isInBreach: false,
        },

        {
          timestamp: new Date('2019-04-14T12:15:00'),
          temperature: 1.5,
          batches,
          isInBreach: true,
        },
        {
          timestamp: new Date('2019-04-14T12:30:00'),
          temperature: 1,
          batches,
          isInBreach: true,
        },
        {
          timestamp: new Date('2019-04-14T12:45:00'),
          temperature: 0.8,
          batches,
          isInBreach: true,
        },
        {
          timestamp: new Date('2019-04-14T13:00:00'),
          temperature: 1,
          batches,
          isInBreach: true,
        },
        {
          timestamp: new Date('2019-04-14T13:15:00'),
          temperature: 0.3,
          batches,
          isInBreach: true,
        },
        {
          timestamp: new Date('2019-04-14T13:30:00'),
          temperature: 1.2,
          batches,
          isInBreach: true,
        },
        {
          timestamp: new Date('2019-04-14T13:45:00'),
          temperature: 1.9,
          batches,
          isInBreach: true,
        },

        {
          timestamp: new Date('2019-04-14T14:00:00'),
          temperature: 2.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-13T12:00:00'),
          temperature: 4.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-13T12:00:00'),
          temperature: 2.4,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-12T12:00:00'),
          temperature: 3.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-12T12:00:00'),
          temperature: 2.1,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-11T12:00:00'), temperature: 4, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-11T12:00:00'),
          temperature: 2.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-10T12:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-10T12:00:00'),
          temperature: 4.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-09T12:00:00'),
          temperature: 5.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-09T12:00:00'),
          temperature: 3.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-08T12:00:00'),
          temperature: 4.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-08T12:00:00'),
          temperature: 3.2,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-07T12:00:00'),
          temperature: 5.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-07T12:00:00'),
          temperature: 4.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-20T12:00:00'),
          temperature: 5.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-20T12:00:00'),
          temperature: 3.2,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-21T12:00:00'),
          temperature: 5.4,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-21T12:00:00'),
          temperature: 2.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-22T12:00:00'),
          temperature: 5.7,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-22T12:00:00'),
          temperature: 4.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-23T12:00:00'),
          temperature: 6.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-23T12:00:00'),
          temperature: 4.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-24T12:00:00'),
          temperature: 6.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-24T12:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-25T12:00:00'),
          temperature: 4.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-25T12:00:00'),
          temperature: 5.7,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-26T12:00:00'),
          temperature: 6.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-26T12:00:00'),
          temperature: 5.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-27T12:00:00'),
          temperature: 7.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-27T12:00:00'),
          temperature: 5.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T17:00:00'),
          temperature: 7.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T16:00:00'),
          temperature: 6.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T16:30:00'),
          temperature: 7.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T17:00:00'),
          temperature: 7.8,
          batches,
          isInBreach: true,
        },
        { timestamp: new Date('2019-04-28T17:30:00'), temperature: 8.5, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T18:00:00'), temperature: 9.3, batches, isInBreach: true },
        {
          timestamp: new Date('2019-04-28T18:30:00'),
          temperature: 10.5,
          batches,
          isInBreach: true,
        },
        { timestamp: new Date('2019-04-28T19:00:00'), temperature: 9.6, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T19:30:00'), temperature: 8.2, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T20:00:00'), temperature: 8.8, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T20:30:00'), temperature: 8.6, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T21:00:00'), temperature: 9.4, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T21:30:00'), temperature: 8.7, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T22:00:00'), temperature: 9.2, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T22:30:00'), temperature: 8.2, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T23:00:00'), temperature: 8.3, batches, isInBreach: true },
        { timestamp: new Date('2019-04-28T23:30:00'), temperature: 8.9, batches, isInBreach: true },
      ];

      for (let i = 0; i < sensor1logs.length; i += 1) {
        const currentSensorLog = this.database.update('SensorLog', {
          id: `sen1log${i}`,
          ...sensor1logs[i],
          sensor: sensor2,
          location: fridge2,
          pointer: i + 1,
          logInterval: 15,
          batches: null,
        });

        ItemBatches.forEach(batch => {
          if (!batch.sensorLogs.find(sensorLog => sensorLog.id === `sen1log${i}`)) {
            batch.sensorLogs.push(currentSensorLog);
            currentSensorLog.itemBatches.push(batch);
          }
        });
      }
      ItemBatches = this.database
        .objects('ItemBatch')
        .filtered('id  != "61059BD30DAE4C5D9F9A31B09266DB2C"');

      const sensor2logs = [
        {
          timestamp: new Date('2019-04-20T12:00:00'),
          temperature: 4.5,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-20T12:00:00'), temperature: 5, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-19T12:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-19T12:00:00'), temperature: 4, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-18T12:00:00'),
          temperature: 3.6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-18T12:00:00'),
          temperature: 2.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-17T12:00:00'),
          temperature: 5.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-17T12:00:00'),
          temperature: 4.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-16T12:00:00'),
          temperature: 3.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-16T12:00:00'),
          temperature: 6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-15T12:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-15T12:00:00'), temperature: 3, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-14T12:00:00'),
          temperature: 4.2,
          batches,
          isInBreach: false,
        },

        {
          timestamp: new Date('2019-04-14T12:15:00'),
          temperature: 3.4,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-14T12:30:00'),
          temperature: 2.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-14T12:45:00'),
          temperature: 3.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-14T13:00:00'),
          temperature: 2.7,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-14T13:15:00'),
          temperature: 3.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-14T13:30:00'),
          temperature: 2.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-14T13:45:00'),
          temperature: 4.1,
          batches,
          isInBreach: false,
        },

        {
          timestamp: new Date('2019-04-14T14:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-13T12:00:00'),
          temperature: 2.7,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-13T12:00:00'),
          temperature: 3.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-12T12:00:00'),
          temperature: 3.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-12T12:00:00'),
          temperature: 2.1,
          batches,
          isInBreach: false,
        },
        { timestamp: new Date('2019-04-11T12:00:00'), temperature: 4, batches, isInBreach: false },
        {
          timestamp: new Date('2019-04-11T12:00:00'),
          temperature: 2.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-10T12:00:00'),
          temperature: 4.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-10T12:00:00'),
          temperature: 3.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-09T12:00:00'),
          temperature: 3.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-09T12:00:00'),
          temperature: 2.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-08T12:00:00'),
          temperature: 2.2,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-08T12:00:00'),
          temperature: 3.0,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-07T12:00:00'),
          temperature: 3.2,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-07T12:00:00'),
          temperature: 2.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-20T12:00:00'),
          temperature: 4,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-20T12:00:00'),
          temperature: 3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-21T12:00:00'),
          temperature: 2.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-21T12:00:00'),
          temperature: 2.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-22T12:00:00'),
          temperature: 3.7,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-22T12:00:00'),
          temperature: 3.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-23T12:00:00'),
          temperature: 2.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-23T12:00:00'),
          temperature: 2.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-24T12:00:00'),
          temperature: 3.1,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-24T12:00:00'),
          temperature: 3.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-25T12:00:00'),
          temperature: 2.9,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-25T12:00:00'),
          temperature: 2.7,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-26T12:00:00'),
          temperature: 4.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-26T12:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-27T12:00:00'),
          temperature: 5.8,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-27T12:00:00'),
          temperature: 2.3,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T17:00:00'),
          temperature: 4.5,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T16:00:00'),
          temperature: 5.6,
          batches,
          isInBreach: false,
        },
        {
          timestamp: new Date('2019-04-28T16:30:00'),
          temperature: 5.2,
          batches,
          isInBreach: false,
        },
      ];

      for (let i = 0; i < sensor2logs.length; i += 1) {
        const currentSensorLog = this.database.update('SensorLog', {
          id: `sen2log${i}`,
          ...sensor2logs[i],
          sensor: sensor1,
          location: fridge1,
          pointer: i + 1,
          logInterval: 15,
          batches: null,
        });
        ItemBatches.forEach(batch => {
          if (!batch.sensorLogs.find(sensorLog => sensorLog.id === `sen2log${i}`)) {
            batch.sensorLogs.push(currentSensorLog);
            currentSensorLog.itemBatches.push(batch);
          }
        });
      }

      const fridge3filter = this.database.objects('Location').filtered('id = $0', 'LOCUUID2');
      if (fridge3filter.length > 0) this.database.delete('Location', fridge3filter);
      const straySeneosrLogs = this.database
        .objects('SensorLog')
        .filtered(
          'location.id = null || id = "sensorLogUUID1" || id = "senLogUUID1" || id = "BCA"'
        );
      if (straySeneosrLogs.length > 0) this.database.delete('Location', straySeneosrLogs);
      const straySensor = this.database.objects('Sensor').filtered('id = "ABC"');
      if (straySensor.length > 0) this.database.delete('Sensor', straySensor);

      this.database.update('Setting', {
        key: 'SyncSiteName',
        value: 'Health Facility',
      });
      this.database.update('Options', {
        id: '123',
        title: 'VVM Failed',
        type: 'vaccineDisposalReason',
        isActive: true,
      });
      this.database.update('Options', {
        id: '1234',
        title: 'Vial Broken',
        type: 'vaccineDisposalReason',
        isActive: true,
      });
      this.database.update('Options', {
        id: '12345',
        title: 'Frozen',
        type: 'vaccineDisposalReason',
        isActive: true,
      });
      this.database.update('Options', {
        id: '12345678',
        title: 'Over Heated',
        type: 'vaccineDisposalReason',
        isActive: true,
      });
      this.database.update('Options', {
        id: '1234567',
        title: 'Expired',
        type: 'vaccineDisposalReason',
        isActive: true,
      });
      this.database.update('Options', {
        id: '123456',
        title: 'Other',
        type: 'vaccineDisposalReason',
        isActive: true,
      });
    });
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

  runWithLoadingIndicator = async functionToRun => {
    this.database.isLoading = true;
    // We here set up an asyncronous promise that will be resolved after a timeout
    // of 1 millisecond. This allows a fraction of a delay for the javascript thread
    // to unblock and allow the spinner animation to start up. The |functionToRun| should
    // not be run inside a |setTimeout| as that relegates to a lower priority, resulting
    // in very slow performance.
    await new Promise(resolve => {
      this.setState({ isLoading: true }, () => setTimeout(resolve, 1));
    });
    functionToRun();
    this.setState({ isLoading: false });
    this.database.isLoading = false;
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
          onPressManualSync={this.synchronise}
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
