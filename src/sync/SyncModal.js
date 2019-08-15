/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Dimensions, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';

import { PROGRESS_LOADING } from './constants';
import { syncStrings } from '../localization';
import { formatPlural, formatDate } from '../utilities';
import { Button, ProgressBar } from '../widgets';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../globalStyles';

export const SyncModal = ({ database, isOpen, onClose, onPressManualSync, state }) => {
  const getStatusMessage = (progress, total, isSyncing, errorMessage, progressMessage) => {
    let message = '';

    if (errorMessage !== '') {
      message = errorMessage;
    } else if (!isSyncing) {
      const recordsToSyncCount = database.objects('SyncOut').length;
      message =
        recordsToSyncCount > 0
          ? `${recordsToSyncCount} ${syncStrings.records_waiting}`
          : syncStrings.sync_complete;
    } else if (progress >= total) {
      message = syncStrings.checking_server_for_records;
    } else if (progress === PROGRESS_LOADING) {
      message = syncStrings.loading_change_count;
    } else {
      message = progressMessage ? `${progressMessage}\n` : '';
      message += `${progress} of ${formatPlural('@count record', '@count records', total)} updated`;
    }

    return message;
  };

  const getSyncDateLabel = syncTime => {
    if (syncTime > 0) {
      return formatDate(new Date(syncTime), 'H:mm, MMMM D, YYYY');
    }
    return '-';
  };

  const { progress, total, isSyncing, lastSyncTime, errorMessage, progressMessage } = state;

  return (
    <Modal
      isOpen={isOpen}
      style={[globalStyles.modal, localStyles.modal]}
      backdropPressToClose={false}
      backdropOpacity={1}
      swipeToClose={false}
      position="top"
    >
      <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
        <Icon name="md-close" style={localStyles.closeIcon} />
      </TouchableOpacity>
      <View style={localStyles.contentContainer}>
        <View style={localStyles.row}>
          <Text style={localStyles.progressDescription}>
            {getStatusMessage(progress, total, isSyncing, errorMessage, progressMessage)}
          </Text>
          <View style={localStyles.progressBarContainer}>
            <ProgressBar total={total} progress={progress} isComplete={!isSyncing} />
          </View>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.lastSyncText}>{syncStrings.last_successful_sync}</Text>
          <Text style={localStyles.lastSyncText}>{getSyncDateLabel(lastSyncTime)}</Text>
        </View>
        <View style={localStyles.row}>
          <Button
            style={[globalStyles.button, localStyles.button]}
            textStyle={[globalStyles.authFormButtonText, localStyles.buttonText]}
            text={syncStrings.manual_sync}
            onPress={onPressManualSync}
            disabledColor={WARM_GREY}
            isDisabled={isSyncing}
          />
        </View>
      </View>
    </Modal>
  );
};

export default SyncModal;

const localStyles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: DARK_GREY,
    opacity: 0.88,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
  button: {
    width: 200,
    backgroundColor: SUSSOL_ORANGE,
    borderWidth: 0,
    alignSelf: 'center',
  },
  progressDescription: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    width: Dimensions.get('window').width / 3,
    paddingHorizontal: 50,
    paddingVertical: 20,
  },
  lastSyncText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  syncIconRow: {
    flexDirection: 'row',
  },
  exchangeIcon: {
    opacity: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
});

/* eslint-disable react/require-default-props, react/forbid-prop-types */
SyncModal.propTypes = {
  database: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onPressManualSync: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

/* eslint-disable react/default-props-match-prop-types */
SyncModal.defaultProps = {
  progress: 0,
  total: 0,
  errorMessage: '',
  lastSyncDate: undefined,
  isSyncing: false,
};
