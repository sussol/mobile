import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import { useIntervalReRender } from '../hooks';
import { TextWithIcon } from './Typography/index';
import { MILLISECONDS } from '../utilities/index';
import { WifiIcon, WifiOffIcon } from './icons';
import { MISTY_CHARCOAL } from '../globalStyles/index';
import {
  selectIsDownloading,
  selectLastDownloadFailed,
  selectLastDownloadTime,
} from '../selectors/Bluetooth/sensorDownload';
import { vaccineStrings, generalStrings } from '../localization';
import { selectSensorByMac } from '../selectors/Entities/sensor';

const formatLastSyncDate = date => (date ? moment(date).fromNow() : generalStrings.not_available);
const formatLogDelay = delay =>
  `${vaccineStrings.logging_delayed_until}: ${moment(delay).format('DD/MM/YYYY @ HH:mm:ss')}`;

const getText = (isPaused, isDelayed, logDelay, lastDownloadTime) => {
  if (isPaused) {
    return vaccineStrings.is_paused;
  }
  if (isDelayed) {
    return formatLogDelay(logDelay);
  }
  return formatLastSyncDate(lastDownloadTime);
};

export const LastSensorDownloadComponent = ({
  isDownloading,
  isPaused,
  lastDownloadFailed,
  lastDownloadTime,
  logDelay,
}) => {
  useIntervalReRender(MILLISECONDS.TEN_SECONDS);

  const timeNow = new Date().getTime();
  const isDelayed = logDelay > timeNow;

  const wifiRef = useRef();

  useEffect(() => {
    if (isDownloading) wifiRef?.current.flash(MILLISECONDS.ONE_SECOND);
    else wifiRef?.current?.stopAnimation();
  }, [isDownloading, wifiRef]);

  return (
    <Animatable.View
      ref={wifiRef}
      animation="flash"
      easing="ease-out"
      iterationCount="infinite"
      style={{ justifyContent: 'center' }}
    >
      <TextWithIcon
        containerStyle={localStyles.headerTextWithIcon}
        margin={0}
        size="s"
        Icon={
          lastDownloadFailed || isDelayed || isPaused ? (
            <WifiOffIcon size={20} color={MISTY_CHARCOAL} />
          ) : (
            <WifiIcon size={20} color={MISTY_CHARCOAL} />
          )
        }
      >
        {getText(isPaused, isDelayed, logDelay, lastDownloadTime)}
      </TextWithIcon>
    </Animatable.View>
  );
};

LastSensorDownloadComponent.defaultProps = {
  lastDownloadTime: null,
  logDelay: 0,
};

LastSensorDownloadComponent.propTypes = {
  isDownloading: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  lastDownloadFailed: PropTypes.bool.isRequired,
  lastDownloadTime: PropTypes.instanceOf(Date),
  logDelay: PropTypes.number,
};

const localStyles = StyleSheet.create({
  headerTextWithIcon: {
    flex: 0,
    paddingHorizontal: 8,
    width: 150,
    justifyContent: 'flex-end',
  },
});

const stateToProps = (state, props) => {
  const { macAddress } = props;

  const lastDownloadTime = selectLastDownloadTime(state, macAddress);
  const lastDownloadFailed = selectLastDownloadFailed(state, macAddress);
  const isDownloading = selectIsDownloading(state, macAddress);

  const sensor = selectSensorByMac(state, macAddress);
  const { isPaused = false, logDelay } = sensor || {};

  return { lastDownloadTime, lastDownloadFailed, isDownloading, logDelay, isPaused };
};

export const LastSensorDownload = connect(stateToProps)(LastSensorDownloadComponent);
