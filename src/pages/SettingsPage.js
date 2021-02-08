/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ValidUrl from 'valid-url';
import { Text, View, ToastAndroid, TouchableOpacity } from 'react-native';
import { hashPassword } from 'sussol-utilities';
import { Button } from 'react-native-ui-components';

import { UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { MILLISECONDS, MODAL_KEYS } from '../utilities';

import {
  gotoEditSensorPage,
  gotoFridgeDetailPage,
  gotoNewSensorPage,
  gotoRealmExplorer,
} from '../navigation/actions';

import { ConfirmIcon } from '../widgets/icons';
import { DataTablePageView, PageInfo } from '../widgets';
import { DataTablePageModal } from '../widgets/modals';

import globalStyles from '../globalStyles';
import { generalStrings, buttonStrings } from '../localization';
import { selectCurrentUserPasswordHash } from '../selectors/user';
import { PermissionActions } from '../actions/PermissionActions';
import { createRecord } from '../database/utilities/index';
import { BreachManager } from '../bluetooth/BreachManager';
import { VaccineDataAccess } from '../bluetooth/VaccineDataAccess';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';

const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);

  const success = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success ? generalStrings.exported_data : generalStrings.couldnt_export_data;

  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Settings = ({ toRealmExplorer, currentUserPasswordHash, requestStorageWritePermission }) => {
  const [state, setState] = useState({
    syncURL: UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL),
    modalKey: '',
    syncPassword: '',
  });

  const withLoadingIndicator = useLoadingIndicator();

  const { modalKey, syncURL, syncPassword } = state;

  const closeModal = () => setState({ ...state, modalKey: '' });
  const openModal = newModalKey => setState({ ...state, modalKey: newModalKey });
  const onSave = () => openModal(MODAL_KEYS.CONFIRM_USER_PASSWORD);

  const editSyncURL = newSyncURL => {
    if (!ValidUrl.isWebUri(newSyncURL)) ToastAndroid.show('Not a valid URL', ToastAndroid.LONG);
    else setState({ ...state, modalKey: '', syncURL: newSyncURL });
  };
  const editSyncPassword = newSyncPassword =>
    setState({ ...state, modalKey: '', syncPassword: newSyncPassword });

  const save = enteredPassword => {
    const passwordMatch = hashPassword(enteredPassword) === currentUserPasswordHash;
    const toastMessage = passwordMatch
      ? generalStrings.new_details_saved
      : generalStrings.new_details_not_saved;

    if (passwordMatch) {
      UIDatabase.write(() => {
        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_URL,
          value: syncURL,
        });

        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH,
          value: syncPassword ? hashPassword(syncPassword) : currentUserPasswordHash,
        });
      });
    }

    ToastAndroid.show(toastMessage, ToastAndroid.LONG);
    closeModal();
  };

  const getModalSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SYNC_URL_EDIT:
        return editSyncURL;
      case MODAL_KEYS.SYNC_PASSWORD_EDIT:
        return editSyncPassword;
      case MODAL_KEYS.CONFIRM_USER_PASSWORD:
        return save;
      default:
        return null;
    }
  };

  const { menuButton, menuButtonText } = globalStyles;
  const { row, column, marginRight, topRow } = styles;

  const MenuButton = useCallback(
    props => <Button style={menuButton} textStyle={menuButtonText} {...props} />,
    []
  );

  const pageInfoColumns = useMemo(
    () => [
      [
        {
          title: `${generalStrings.sync_url}:`,
          editableType: 'text',
          info: syncURL,
          onPress: () => openModal(MODAL_KEYS.SYNC_URL_EDIT),
        },
        {
          title: `${generalStrings.sync_password}:`,
          editableType: 'text',
          info: '',
          onPress: () => openModal(MODAL_KEYS.SYNC_PASSWORD_EDIT),
        },
      ],
    ],
    [syncURL]
  );

  const createTemperatureLogs = (sensor, idSuffix, logCount, generateTemperature) => {
    const currentDate = new Date();
    let count = 0;

    for (let i = -1 * logCount; i < logCount; i++) {
      const { logInterval } = sensor;
      count += 1;
      UIDatabase.create('TemperatureLog', {
        id: `${i}${idSuffix}`,
        temperature: generateTemperature(i),
        logInterval,
        timestamp: new Date(currentDate - logInterval * 1000 * count),
        location: sensor.location,
        sensor,
      });
    }
  };

  const createVaccineData = () => {
    UIDatabase.write(() => {
      const oldLocations = UIDatabase.objects('Location');
      UIDatabase.delete('Location', oldLocations);
      const oldConfigs = UIDatabase.objects('TemperatureBreachConfiguration');
      UIDatabase.delete('TemperatureBreachConfiguration', oldConfigs);
      const oldSensors = UIDatabase.objects('Sensor');
      UIDatabase.delete('Sensor', oldSensors);
      const oldLogs = UIDatabase.objects('TemperatureLog');
      UIDatabase.delete('TemperatureLog', oldLogs);
      const oldUIDatabaseBreaches = UIDatabase.objects('TemperatureBreach');
      UIDatabase.delete('TemperatureBreach', oldUIDatabaseBreaches);

      // create locations
      const fridge1 = createRecord(UIDatabase, 'Location', { description: 'Fridge 1', code: 'f1' });
      const fridge2 = createRecord(UIDatabase, 'Location', { description: 'Fridge 2', code: 'f2' });
      const fridge3 = createRecord(UIDatabase, 'Location', { description: 'Fridge 3', code: 'f3' });
      const fridge4 = createRecord(UIDatabase, 'Location', { description: 'Fridge 4', code: 'f4' });
      const fridge5 = createRecord(UIDatabase, 'Location', { description: 'Fridge 5', code: 'f5' });

      // create sensors
      createRecord(UIDatabase, 'Sensor', {
        name: 'sensor 1',
        macAddress: '00:00:00:00:00:01',
        batteryLevel: 10,
        location: fridge1,
        isActive: false,
      });
      createRecord(UIDatabase, 'Sensor', {
        name: 'sensor 2',
        macAddress: '00:00:00:00:00:02',
        batteryLevel: 20,
        location: fridge2,
        isActive: false,
      });
      createRecord(UIDatabase, 'Sensor', {
        name: 'sensor 3',
        macAddress: '00:00:00:00:00:03',
        batteryLevel: 30,
        location: fridge3,
        isActive: false,
      });
      createRecord(UIDatabase, 'Sensor', {
        name: 'sensor 4',
        macAddress: '00:00:00:00:00:04',
        batteryLevel: 40,
        location: fridge4,
        isActive: false,
      });
      createRecord(UIDatabase, 'Sensor', {
        name: 'sensor 5',
        macAddress: '00:00:00:00:00:05',
        batteryLevel: 50,
        location: fridge5,
        isActive: false,
      });

      // create some configs
      UIDatabase.objects('Location').forEach((location, i) => {
        const { id: locationID } = location;
        UIDatabase.update('TemperatureBreachConfiguration', {
          id: `${locationID}${i + 1}`,
          minimumTemperature: 8,
          maximumTemperature: 999,
          duration: 20 * MILLISECONDS.ONE_MINUTE,
          description: 'Config 1, 8 to 999 consecutive for 20 minutes',
          type: 'HOT_CONSECUTIVE',
          location,
        });

        UIDatabase.update('TemperatureBreachConfiguration', {
          id: `${locationID}${i + 2}`,
          minimumTemperature: -999,
          maximumTemperature: 0,
          duration: 20 * MILLISECONDS.ONE_MINUTE,
          description: 'Config 1, 0 to -999 consecutive for 20 minutes',
          type: 'COLD_CONSECUTIVE',
          location,
        });

        UIDatabase.update('TemperatureBreachConfiguration', {
          id: `${locationID}${i + 3}`,
          minimumTemperature: 8,
          maximumTemperature: 999,
          duration: 60 * MILLISECONDS.ONE_MINUTE,
          description: 'Config 1, 8 to 999 cumulative for 1 hour',
          type: 'HOT_CUMULATIVE',
          location,
        });

        UIDatabase.update('TemperatureBreachConfiguration', {
          id: `${locationID}${i + 4}`,
          minimumTemperature: -999,
          maximumTemperature: 0,
          duration: 60 * MILLISECONDS.ONE_MINUTE,
          description: 'Config 1, 0 to -999 cumulative',
          type: 'COLD_CUMULATIVE',
          location,
        });
      });

      // create some logs. Leaving one location with no logs for handling that situation

      const sensors = UIDatabase.objects('Sensor');

      createTemperatureLogs(
        sensors[0],
        'a',
        250,
        () => Math.floor((Math.random() * 20 + 5) * 100) / 100
      );

      createTemperatureLogs(sensors[1], 'b', 100, n => Math.random() * 40 - 20 - n);
      createTemperatureLogs(sensors[2], 'c', 50, n => Math.random() * 40 - 10 + n);
    });

    // create breaches
    const utils = {};
    utils.createUuid = () => String(Math.random());
    const vaccineDB = new VaccineDataAccess(UIDatabase);
    const breachManager = new BreachManager(vaccineDB, utils);
    const sensors = UIDatabase.objects('Sensor');
    const configs = vaccineDB.getBreachConfigs();

    const promises = sensors.map(sensor => {
      const [breaches, logs] = breachManager.createBreaches(
        sensor,
        sensor.logs.sorted('timestamp'),
        configs
      );
      return breachManager.updateBreaches(breaches, logs);
    });
    Promise.all(promises).then(() => ToastAndroid.show('Data generated', ToastAndroid.SHORT));
  };

  return (
    <DataTablePageView>
      <TouchableOpacity style={topRow} onPress={onSave}>
        <Text style={marginRight}>{buttonStrings.save_changes}</Text>
        <ConfirmIcon />
      </TouchableOpacity>

      <View style={row}>
        <View style={column}>
          <PageInfo columns={pageInfoColumns} />
        </View>
        <View>
          <MenuButton text={buttonStrings.realm_explorer} onPress={toRealmExplorer} />
          <MenuButton text={buttonStrings.export_data} onPress={requestStorageWritePermission} />
          <MenuButton
            text="Generate vaccine data"
            onPress={() => withLoadingIndicator(createVaccineData)}
          />
        </View>
      </View>

      <DataTablePageModal
        isOpen={!!modalKey}
        modalKey={modalKey}
        currentValue={modalKey === MODAL_KEYS.SYNC_URL_EDIT ? syncURL : ''}
        onClose={closeModal}
        onSelect={getModalSelect(modalKey)}
      />
    </DataTablePageView>
  );
};

const mapStateToDispatch = dispatch => ({
  toRealmExplorer: () => dispatch(gotoRealmExplorer()),
  toEditSensorPage: sensor => dispatch(gotoEditSensorPage(sensor)),
  toFridgeDetail: fridge => dispatch(gotoFridgeDetailPage(fridge)),
  toNewSensorPage: () => dispatch(gotoNewSensorPage()),
  requestStorageWritePermission: () =>
    dispatch(PermissionActions.requestWriteStorage()).then(exportData),
});

const mapStateToProps = state => ({
  currentUserPasswordHash: selectCurrentUserPasswordHash(state),
});

const styles = {
  row: { flex: 1, flexDirection: 'row' },
  column: { flex: 1, flexDirection: 'column' },
  marginRight: { marginRight: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
};

export const SettingsPage = connect(mapStateToProps, mapStateToDispatch)(Settings);

Settings.propTypes = {
  toRealmExplorer: PropTypes.func.isRequired,
  currentUserPasswordHash: PropTypes.string.isRequired,
  requestStorageWritePermission: PropTypes.func.isRequired,
};
