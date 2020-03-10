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
import { DataTablePageView, PageInfo } from '../widgets';
import { DataTablePageModal } from '../widgets/modals';

import globalStyles from '../globalStyles';
import { generalStrings, buttonStrings } from '../localization';
import { selectCurrentUserPasswordHash } from '../selectors/user';

const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const { success, message } = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success
    ? generalStrings.exported_data
    : `${generalStrings.couldnt_export_data}: ${message}`;
  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Settings = ({ toRealmExplorer, currentUserPasswordHash }) => {
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
          <MenuButton text={buttonStrings.export_data} onPress={exportData} />
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
};
