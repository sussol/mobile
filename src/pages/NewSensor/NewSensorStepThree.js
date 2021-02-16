/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import moment from 'moment';
import { ToastAndroid, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TabContainer } from './TabContainer';
import {
  CalendarIcon,
  HazardIcon,
  InfoIcon,
  Paper,
  FlexRow,
  PageButton,
  Spacer,
  TextWithIcon,
  TextEditor,
  EditorRow,
  DurationEditor,
} from '../../widgets';

import { goBack } from '../../navigation/actions';
import { selectNewSensor } from '../../selectors/Entities/sensor';
import { WizardActions, LocationActions, SensorActions } from '../../actions';
import { SensorUpdateActions } from '../../actions/Bluetooth/SensorUpdateActions';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { DARKER_GREY, LIGHT_GREY, SUSSOL_ORANGE, WHITE } from '../../globalStyles';
import { buttonStrings, vaccineStrings } from '../../localization';
import { selectNewLocation } from '../../selectors/Entities/location';
import { SECONDS } from '../../utilities/constants';
import { VACCINE_CONSTANTS } from '../../utilities/modules/vaccines/constants';

export const NewSensorStepThreeComponent = ({
  logInterval,
  logDelay,
  name,
  code,
  updateName,
  connectToSensor,
  updateCode,
  updateLogInterval,
  updateLogDelay,
  exit,
  previousTab,
  macAddress,
}) => {
  const withLoadingIndicator = useLoadingIndicator();

  const startingTime = useRef(moment());
  const logDelayAsMinutes = moment.duration(moment(logDelay).diff(startingTime.current)).minutes();

  return (
    <TabContainer>
      <Paper height={200} headerText={vaccineStrings.new_sensor_step_three_title}>
        <EditorRow
          containerStyle={localStyles.paperContentRow}
          label={vaccineStrings.sensor_name}
          Icon={<InfoIcon color={DARKER_GREY} />}
        >
          <TextEditor size="large" value={name} onChangeText={updateName} />
          <TextEditor label={vaccineStrings.sensor_code} value={code} onChangeText={updateCode} />
        </EditorRow>

        <EditorRow
          containerStyle={localStyles.paperContentRow}
          label={vaccineStrings.logging_interval}
          Icon={<InfoIcon color={DARKER_GREY} />}
        >
          <DurationEditor
            value={logInterval / SECONDS.ONE_MINUTE}
            label=""
            onChange={updateLogInterval}
          />
        </EditorRow>
      </Paper>

      <Paper>
        <EditorRow
          containerStyle={localStyles.paperContentRow}
          label={vaccineStrings.start_logging}
          Icon={<CalendarIcon color={DARKER_GREY} />}
        >
          <DurationEditor
            maxValue={VACCINE_CONSTANTS.MAX_LOGGING_DELAY_MINUTES}
            value={logDelayAsMinutes}
            label=""
            onChange={duration => {
              const newDate = moment(startingTime.current).add(duration, 'm');
              updateLogDelay(newDate.toDate());
            }}
          />
        </EditorRow>
      </Paper>

      <TextWithIcon left size="s" Icon={<HazardIcon color={LIGHT_GREY} />}>
        {vaccineStrings.please_be_in_close_proximity}
      </TextWithIcon>

      <FlexRow flex={1} justifyContent="flex-end" alignItems="flex-end">
        <PageButton
          text={buttonStrings.back}
          onPress={previousTab}
          style={{ marginRight: 'auto' }}
        />

        <PageButton text={buttonStrings.cancel} onPress={exit} />

        <Spacer space={20} />

        <PageButton
          text={vaccineStrings.connect}
          style={{ backgroundColor: SUSSOL_ORANGE }}
          textStyle={{ color: WHITE, textTransform: 'capitalize' }}
          onPress={() => withLoadingIndicator(connectToSensor({ macAddress, logInterval }))}
        />
      </FlexRow>
    </TabContainer>
  );
};

const dispatchToProps = dispatch => {
  const updateName = value => dispatch(SensorActions.updateNewSensor(value, 'name'));
  const updateCode = value => dispatch(LocationActions.updateNew(value, 'code'));
  const updateLogDelay = value =>
    dispatch(SensorActions.updateNewSensor(new Date(value).getTime(), 'logDelay'));
  const updateLogInterval = value =>
    dispatch(SensorActions.updateNewSensor(value * SECONDS.ONE_MINUTE, 'logInterval'));
  const previousTab = () => dispatch(WizardActions.previousTab());
  const exit = () => dispatch(goBack());
  const connectToSensor = sensor => () =>
    dispatch(SensorUpdateActions.updateSensor(sensor))
      .then(() => dispatch(SensorActions.createNew()))
      .then(() => {
        ToastAndroid.show(vaccineStrings.sensor_save_success, ToastAndroid.LONG);
        dispatch(goBack());
      })
      .catch(reason => {
        ToastAndroid.show(reason.toString(), ToastAndroid.LONG);
      });

  return {
    previousTab,
    connectToSensor,
    exit,
    updateName,
    updateCode,
    updateLogDelay,
    updateLogInterval,
  };
};

const localStyles = StyleSheet.create({
  paperContentRow: {
    padding: 8,
  },
});

const stateToProps = state => {
  const newSensor = selectNewSensor(state);
  const location = selectNewLocation(state);

  const { logInterval, logDelay, name, macAddress } = newSensor ?? {};
  const { code } = location ?? {};

  return { logInterval, logDelay: new Date(logDelay), name, code, macAddress };
};

NewSensorStepThreeComponent.defaultProps = {
  macAddress: '',
  logDelay: new Date(),
  logInterval: 300,
  name: '',
  code: '',
};

NewSensorStepThreeComponent.propTypes = {
  logInterval: PropTypes.number,
  logDelay: PropTypes.object,
  name: PropTypes.string,
  code: PropTypes.string,
  macAddress: PropTypes.string,
  updateName: PropTypes.func.isRequired,
  updateCode: PropTypes.func.isRequired,
  updateLogDelay: PropTypes.func.isRequired,
  updateLogInterval: PropTypes.func.isRequired,
  exit: PropTypes.func.isRequired,
  previousTab: PropTypes.func.isRequired,
  connectToSensor: PropTypes.func.isRequired,
};

export const NewSensorStepThree = connect(
  stateToProps,
  dispatchToProps
)(NewSensorStepThreeComponent);
