import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import { TextWithIcon } from './Typography/index';
import { BatteryIcon, CogIcon, DownloadIcon } from './icons';
import { APP_FONT_FAMILY, BLACK, DARKER_GREY, MISTY_CHARCOAL } from '../globalStyles/index';
import { IconButton } from './IconButton';
import { FlexView } from './FlexView';
import { selectSensorState } from '../selectors/Entities/sensor';
import { gotoEditSensorPage } from '../navigation/actions';
import { LastSensorDownload } from './LastSensorDownload';
import { BlinkSensorButton } from './BlinkSensorButton';

const formatBatteryLevel = batteryLevel => `${batteryLevel}%`;

export const FridgeHeaderComponent = ({ batteryLevel, name, macAddress, editSensor, showCog }) => (
  <>
    <FlexView justifyContent="center">
      <Text style={localStyles.paperTitleText}>{name}</Text>
    </FlexView>
    <TextWithIcon
      containerStyle={localStyles.headerTextWithIcon}
      size="s"
      Icon={<BatteryIcon color={MISTY_CHARCOAL} />}
    >
      {formatBatteryLevel(batteryLevel)}
    </TextWithIcon>

    <LastSensorDownload macAddress={macAddress} />

    <IconButton
      Icon={<DownloadIcon color={DARKER_GREY} />}
      containerStyle={{ width: 50, justifyContent: 'center' }}
    />
    <BlinkSensorButton macAddress={macAddress} />
    {showCog && (
      <IconButton
        Icon={<CogIcon color={BLACK} />}
        onPress={editSensor}
        containerStyle={{ width: 50, justifyContent: 'center' }}
      />
    )}
  </>
);

FridgeHeaderComponent.defaultProps = {
  macAddress: 'AA:BB:CC:DD:EE:FF',
  batteryLevel: 99,
  name: '',
  showCog: false,
};

FridgeHeaderComponent.propTypes = {
  name: PropTypes.string,
  macAddress: PropTypes.string,
  batteryLevel: PropTypes.number,
  editSensor: PropTypes.func.isRequired,
  showCog: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  paperTitleText: {
    color: DARKER_GREY,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
  },
  headerTextWithIcon: {
    flex: 0,
    paddingHorizontal: 8,
  },
});

const stateToProps = (state, props) => {
  const { sensor } = props;
  const { id: sensorID, macAddress } = sensor ?? {};

  const { byId = {} } = selectSensorState(state) ?? {};
  const sensorState = byId[sensorID];
  const { batteryLevel, name } = sensorState ?? {};

  return { batteryLevel, name, macAddress };
};

const dispatchToProps = (dispatch, props) => {
  const { sensor } = props;

  const editSensor = () => dispatch(gotoEditSensorPage(sensor));

  return { editSensor };
};

export const FridgeHeader = connect(stateToProps, dispatchToProps)(FridgeHeaderComponent);
