import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';
import { DARKER_GREY, LIGHT_GREY } from '../globalStyles/index';
import { IconButton } from './IconButton';
import { LightbulbIcon } from './icons';
import { selectSendingBlinkTo } from '../selectors/Bluetooth/bluetooth';
import { BlinkActions } from '../actions/Bluetooth/BlinkActions';

export const BlinkSensorButtonComponent = ({ isBlinking, blink, isBlinkDisabled }) =>
  isBlinking ? (
    <ActivityIndicator style={{ width: 50 }} size="small" color={DARKER_GREY} />
  ) : (
    <IconButton
      containerStyle={{ width: 50, justifyContent: 'center' }}
      Icon={<LightbulbIcon color={isBlinkDisabled ? LIGHT_GREY : DARKER_GREY} />}
      onPress={blink}
      isDisabled={!!isBlinkDisabled}
    />
  );

BlinkSensorButtonComponent.propTypes = {
  isBlinkDisabled: PropTypes.bool.isRequired,
  blink: PropTypes.func.isRequired,
  isBlinking: PropTypes.bool.isRequired,
};

const stateToProps = (state, props) => {
  const { macAddress } = props;

  const sendingBlinkTo = selectSendingBlinkTo(state);
  const isBlinking = sendingBlinkTo === macAddress;
  const isBlinkDisabled = !isBlinking && !!sendingBlinkTo;

  return { isBlinking, isBlinkDisabled };
};

const dispatchToProps = (dispatch, props) => {
  const { macAddress } = props;

  const blink = () => dispatch(BlinkActions.startSensorBlink(macAddress));

  return { blink };
};

export const BlinkSensorButton = connect(stateToProps, dispatchToProps)(BlinkSensorButtonComponent);
