/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { TemperatureSyncIcon } from './TemperatureSyncIcon';

import globalStyles from '../globalStyles';

import { TemperatureSyncActions } from '../actions/TemperatureSyncActions';
import {
  selectTemperatureSyncStateMessage,
  selectIsSyncingTemperatures,
} from '../selectors/temperatureSync';

const mapStateToProps = state => {
  const syncMessage = selectTemperatureSyncStateMessage(state);
  const isSyncing = selectIsSyncingTemperatures(state);

  return { syncMessage, isSyncing };
};

const mapDispatchToProps = dispatch => {
  const onOpenModal = () => dispatch(TemperatureSyncActions.openModal());
  return { onOpenModal };
};

export const TemperatureSyncStateComponent = ({ isSyncing, onOpenModal, syncMessage }) => (
  <TouchableOpacity onPress={onOpenModal} style={localStyles.container}>
    <Text style={globalStyles.navBarText}>{syncMessage}</Text>
    <TemperatureSyncIcon isActive={isSyncing} />
  </TouchableOpacity>
);

const localStyles = StyleSheet.create({
  container: {
    ...globalStyles.navBarRightContainer,
    marginLeft: 20,
  },
});

TemperatureSyncStateComponent.propTypes = {
  syncMessage: PropTypes.string.isRequired,
  onOpenModal: PropTypes.func.isRequired,
  isSyncing: PropTypes.bool.isRequired,
};

export const TemperatureSyncState = connect(
  mapStateToProps,
  mapDispatchToProps
)(TemperatureSyncStateComponent);
