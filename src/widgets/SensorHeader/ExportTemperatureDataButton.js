/* eslint-disable react/forbid-prop-types */
/* eslint-disable arrow-body-style */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TextInput, ToastAndroid, StyleSheet } from 'react-native';

import { IconButton } from '../IconButton';
import { DownloadIcon } from '../icons';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperInputModal } from '../PaperModal/PaperInputModal';

import { useToggle } from '../../hooks/useToggle';
import { PermissionActions } from '../../actions/PermissionActions';
import { emailVaccineReport } from '../../utilities/vaccineReport';
import { selectCurrentUser } from '../../selectors/user';
import { useLoadingIndicator } from '../../hooks/index';
import { BLACK, SUSSOL_ORANGE } from '../../globalStyles/index';
import { generalStrings, vaccineStrings } from '../../localization/index';
import { UIDatabase } from '../../database/index';

const toastReportGenerationFailed = () =>
  ToastAndroid.show(generalStrings.report_generation_failed, ToastAndroid.LONG);
const toastNoPermission = () =>
  ToastAndroid.show(generalStrings.require_permission_to_send_data, ToastAndroid.LONG);
const toastNoTemperatures = () => {
  ToastAndroid.show(vaccineStrings.no_temperatures, ToastAndroid.LONG);
};

export const ExportTemperatureDataButtonComponent = ({
  macAddress,
  requestStorageWritePermission,
  currentUser,
}) => {
  const [isOpen, toggle] = useToggle(false);
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const withLoadingIndicator = useLoadingIndicator();
  const emailRef = useRef(null);
  const commentRef = useRef(null);

  const reset = () => {
    toggle();
    setEmail('');
    setComment('');
  };

  const tryDownload = () =>
    // Request storage permission is a thunk which returns true/false if permission was granted.
    // If permission has already been granted, true is returned.
    requestStorageWritePermission()
      // After checking for storage write permission, cache the current email/comment and clear
      // the current state - primarily to close the modal, making room for the full-screen spinner.
      // or so the modal is closed and a toast will provide feedback.
      .then(success => {
        const cached = { emailValue: email, commentValue: comment, success };
        if (!success) toastNoPermission();
        reset();
        return cached;
      })
      // Once permission has been ensured, the dialog is closed and sensor logs are found,
      // block with a full screen spinner while generating the report - it could be large.
      .then(({ success, emailValue, commentValue }) => {
        if (success) {
          const sensor = UIDatabase.get('Sensor', macAddress, 'macAddress');
          if (!sensor) throw new Error('Cannot find sensor');
          if (sensor?.logs <= 0) {
            toastNoTemperatures();
            return;
          }

          withLoadingIndicator(() =>
            emailVaccineReport(sensor, currentUser, emailValue, commentValue)
          );
        }
      })
      .catch(() => toastReportGenerationFailed());

  return (
    <>
      <IconButton
        onPress={toggle}
        Icon={<DownloadIcon color={BLACK} />}
        containerStyle={localStyles.iconButton}
      />
      <PaperModalContainer isVisible={isOpen} onClose={reset}>
        <PaperInputModal
          content={generalStrings.a_csv_file}
          Icon={<DownloadIcon size={40} />}
          buttonText={generalStrings.download}
          placeholder={generalStrings.email}
          onButtonPress={tryDownload}
        >
          <TextInput
            selectTextOnFocus
            ref={emailRef}
            placeholder={generalStrings.email}
            underlineColorAndroid={SUSSOL_ORANGE}
            value={email}
            style={localStyles.textInput}
            onChangeText={setEmail}
            blurOnSubmit={false}
            onSubmitEditing={() => commentRef?.current?.focus()}
          />
          <TextInput
            selectTextOnFocus
            ref={commentRef}
            placeholder={generalStrings.comment}
            underlineColorAndroid={SUSSOL_ORANGE}
            value={comment}
            style={localStyles.textInput}
            onChangeText={setComment}
            blurOnSubmit={false}
            onSubmitEditing={() => emailRef?.current?.focus()}
          />
        </PaperInputModal>
      </PaperModalContainer>
    </>
  );
};

const localStyles = StyleSheet.create({
  iconButton: {
    flexBasis: 50,
    justifyContent: 'center',
  },
  button: {
    height: 50,
    backgroundColor: SUSSOL_ORANGE,
    width: '100%',
  },
  textInput: {
    color: SUSSOL_ORANGE,
    height: 50,
    fontSize: 14,
    fontWeight: '400',
    width: '100%',
    maxHeight: 50,
  },
});

ExportTemperatureDataButtonComponent.propTypes = {
  macAddress: PropTypes.string.isRequired,
  requestStorageWritePermission: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const stateToProps = state => {
  const currentUser = selectCurrentUser(state);
  return { currentUser };
};

const dispatchToProps = dispatch => {
  const requestStorageWritePermission = () => dispatch(PermissionActions.requestWriteStorage());
  return { requestStorageWritePermission };
};

export const ExportTemperatureDataButton = connect(
  stateToProps,
  dispatchToProps
)(ExportTemperatureDataButtonComponent);
