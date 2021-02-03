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
} from '../selectors/vaccine';
import { generalStrings } from '../localization';

const formatLastSyncDate = date => (date ? moment(date).fromNow() : generalStrings.not_available);

export const LastSensorDownloadComponent = ({
  isDownloading,
  lastDownloadFailed,
  lastDownloadTime,
}) => {
  useIntervalReRender(MILLISECONDS.TEN_SECONDS);

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
        size="s"
        Icon={
          lastDownloadFailed ? (
            <WifiOffIcon size={20} color={MISTY_CHARCOAL} />
          ) : (
            <WifiIcon size={20} color={MISTY_CHARCOAL} />
          )
        }
      >
        {formatLastSyncDate(lastDownloadTime)}
      </TextWithIcon>
    </Animatable.View>
  );
};

LastSensorDownloadComponent.defaultProps = {
  lastDownloadTime: null,
};

LastSensorDownloadComponent.propTypes = {
  isDownloading: PropTypes.bool.isRequired,
  lastDownloadFailed: PropTypes.bool.isRequired,
  lastDownloadTime: PropTypes.instanceOf(Date),
};

const localStyles = StyleSheet.create({
  headerTextWithIcon: {
    flex: 0,
    paddingHorizontal: 8,
  },
});

const stateToProps = (state, props) => {
  const { macAddress } = props;

  const lastDownloadTime = selectLastDownloadTime(state, macAddress);
  const lastDownloadFailed = selectLastDownloadFailed(state, macAddress);
  const isDownloading = selectIsDownloading(state, macAddress);

  return { lastDownloadTime, lastDownloadFailed, isDownloading };
};

export const LastSensorDownload = connect(stateToProps)(LastSensorDownloadComponent);
