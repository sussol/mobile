/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Dimensions, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';

import { PROGRESS_LOADING } from './constants';
import { syncStrings } from '../localization';
import { formatDate } from '../utilities';
import { Button, ProgressBar } from '../widgets';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../globalStyles';
import { UIDatabase } from '../database';
import { closeSyncModal } from '../actions/SyncActions';

export const SyncModalComponent = ({
  syncModalIsOpen,
  onClose,
  onPressManualSync,
  progress,
  total,
  isSyncing,
  lastSyncTime,
  errorMessage,
  progressMessage,
}) => {
  const getStatusMessage = React.useCallback(() => {
    let message = '';

    if (errorMessage !== '') {
      message = errorMessage;
    } else if (!isSyncing) {
      const recordsToSyncCount = UIDatabase.objects('SyncOut').length;
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
      message += `${progress} of ${total} record(s) updated`;
    }

    return message;
  }, [progress, total, isSyncing, errorMessage, progressMessage]);

  const getSyncDateLabel = React.useCallback(syncTime => {
    if (syncTime > 0) {
      return formatDate(new Date(syncTime), 'H:mm, MMMM D, YYYY');
    }
    return '-';
  }, []);

  return (
    <Modal
      isOpen={syncModalIsOpen}
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
            style={[globalStyles.authFormButton, localStyles.button]}
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
    marginVertical: 0,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: SUSSOL_ORANGE,
    borderRadius: 4,
    borderWidth: 0,
    justifyContent: 'center',
    margin: 5,
    padding: 15,
    width: 200,
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

SyncModalComponent.defaultProps = {
  syncModalIsOpen: false,
};

SyncModalComponent.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPressManualSync: PropTypes.func.isRequired,
  syncModalIsOpen: PropTypes.bool,
  progress: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  progressMessage: PropTypes.string.isRequired,
  lastSyncTime: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  const { sync } = state;
  return sync;
};

const mapDispatchToProps = dispatch => {
  const onClose = () => dispatch(closeSyncModal());
  return { onClose };
};

export const SyncModal = connect(mapStateToProps, mapDispatchToProps)(SyncModalComponent);
