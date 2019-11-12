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
import { MODAL_KEYS } from '../utilities';

import { gotoRealmExplorer } from '../navigation/actions';

import { ConfirmIcon } from '../widgets/icons';
import { DataTablePageView, PageInfo } from '../widgets/index';
import { DataTablePageModal } from '../widgets/modals/index';

import globalStyles from '../globalStyles';

const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const { success, message } = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success ? 'Exported data file' : `Couldn't export data: ${message}`;
  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Settings = ({ toRealmExplorer, currentUser }) => {
  const [state, setState] = useState({
    syncURL: UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL),
    modalKey: '',
    syncPassword: '',
  });

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
    const currentUserPassword = currentUser?.passwordHash ?? '';
    const passwordMatch = hashPassword(enteredPassword) === currentUserPassword;
    const toastMessage = passwordMatch
      ? 'New details have been saved'
      : 'Password did not match. New details have not been saved.';

    if (passwordMatch) {
      UIDatabase.write(() => {
        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_URL,
          value: syncURL,
        });

        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH,
          value: hashPassword(syncPassword),
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
          title: 'Sync URL:',
          editableType: 'text',
          info: syncURL,
          onPress: () => openModal(MODAL_KEYS.SYNC_URL_EDIT),
        },
        {
          title: 'Sync password:',
          editableType: 'text',
          info: '',
          onPress: () => openModal(MODAL_KEYS.SYNC_PASSWORD_EDIT),
        },
      ],
    ],
    [syncURL]
  );

  return (
    <DataTablePageView>
      <TouchableOpacity style={topRow} onPress={onSave}>
        <Text style={marginRight}>Save Changes</Text>
        <ConfirmIcon />
      </TouchableOpacity>

      <View style={row}>
        <View style={column}>
          <PageInfo columns={pageInfoColumns} />
        </View>
        <View>
          <MenuButton text="Realm Explorer" onPress={toRealmExplorer} />
          <MenuButton text="Export Data" onPress={exportData} />
        </View>
      </View>

      <DataTablePageModal
        fullScreen={false}
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
});

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
});

const styles = {
  row: { flex: 1, flexDirection: 'row' },
  column: { flex: 1, flexDirection: 'column' },
  marginRight: { marginRight: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
};

export const SettingsPage = connect(
  mapStateToProps,
  mapStateToDispatch
)(Settings);

Settings.propTypes = {
  toRealmExplorer: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};
