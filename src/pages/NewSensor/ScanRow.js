import React from 'react';
import { ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';

import { LightbulbIcon, ChevronRightIcon, FlexRow, IconButton, WifiIcon } from '../../widgets';
import { LIGHT_GREY, SUSSOL_ORANGE, WHITE, DARKER_GREY } from '../../globalStyles';
import { TextWithIcon } from '../../widgets/Typography';
import { vaccineStrings } from '../../localization';
import { WithFixedDimensions } from '../../widgets/WithFixedDimensions';
import { Spacer } from '../../widgets/Spacer';

import { NewSensorActions } from '../../actions';
import { WizardActions } from '../../actions/WizardActions';
import { selectSendingBlinkTo } from '../../selectors/vaccine';
import { BlinkActions } from '../../actions/Bluetooth/BlinkActions';

export const RectangleButton = ({ isDisabled, onPress, isSpinning }) =>
  isSpinning ? (
    <ActivityIndicator style={{ width: 100, height: 30 }} color={SUSSOL_ORANGE} size="small" />
  ) : (
    <IconButton
      isDisabled={isDisabled}
      onPress={onPress}
      rectangle
      Icon={<LightbulbIcon />}
      label={vaccineStrings.blink}
      labelStyle={localStyles.rectangleButtonLabel}
      containerStyle={
        isDisabled
          ? { ...localStyles.rectangleButtonContainer, backgroundColor: LIGHT_GREY }
          : localStyles.rectangleButtonContainer
      }
    />
  );

RectangleButton.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
  isSpinning: PropTypes.bool.isRequired,
};

export const ScanRowComponent = ({ macAddress, blink, isBlinking, isDisabled, selectSensor }) => (
  <Animatable.View animation="fadeIn" duration={1000} useNativeDriver>
    <WithFixedDimensions height={60}>
      <FlexRow flex={0} alignItems="center" justifyContent="flex-end">
        <RectangleButton
          isSpinning={isBlinking}
          isDisabled={isDisabled}
          onPress={() => blink(macAddress)}
        />
        <Spacer space={20} />
        <TextWithIcon left size="ms" Icon={<WifiIcon />}>
          {macAddress}
        </TextWithIcon>

        <IconButton
          onPress={() => selectSensor(macAddress)}
          right
          labelStyle={localStyles.connectText}
          label={vaccineStrings.connect}
          size="ms"
          Icon={<ChevronRightIcon color={DARKER_GREY} />}
        />
      </FlexRow>
    </WithFixedDimensions>
  </Animatable.View>
);

const dispatchToProps = dispatch => {
  const blink = macAddress => dispatch(BlinkActions.startSensorBlink(macAddress));
  const selectSensor = macAddress => {
    dispatch(NewSensorActions.select(macAddress));
    dispatch(WizardActions.nextTab());
  };

  return { blink, selectSensor };
};

const stateToProps = (state, ownProps) => {
  const { macAddress } = ownProps;
  const currentlyBlinking = selectSendingBlinkTo(state);
  // This is the sensor which is being blinked at the moment
  const isBlinking = macAddress === currentlyBlinking;
  // This is not the sensor being blinked, but some other sensor is,
  // so disabled this one.
  const isDisabled = !!currentlyBlinking && !isBlinking;
  return { isDisabled, isBlinking };
};

export const ScanRow = connect(stateToProps, dispatchToProps)(ScanRowComponent);

const localStyles = {
  connectText: { fontSize: 14, color: DARKER_GREY, marginRight: 20, textTransform: 'capitalize' },
  rectangleButtonLabel: { color: WHITE, textTransform: 'uppercase' },
  rectangleButtonContainer: {
    width: 100,
    height: 30,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
  },
};

ScanRowComponent.propTypes = {
  selectSensor: PropTypes.func.isRequired,
  isBlinking: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  macAddress: PropTypes.string.isRequired,
  blink: PropTypes.func.isRequired,
};
