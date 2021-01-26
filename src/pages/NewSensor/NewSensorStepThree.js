/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { ToastAndroid, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TabContainer } from './TabContainer';
import {
  CalendarIcon,
  HazardIcon,
  InfoIcon,
  PaperSection,
  FlexRow,
  PageButton,
  Spacer,
  WithSpace,
  TextWithIcon,
  TextEditor,
  EditorRow,
  DateEditor,
  DurationEditor,
  TimeEditor,
} from '../../widgets';

import { WizardActions } from '../../actions/WizardActions';
import { goBack, gotoSettings } from '../../navigation/actions';
import { selectNewSensor } from '../../selectors/newSensor';
import { NewSensorActions } from '../../actions/index';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { DARKER_GREY, LIGHT_GREY, SUSSOL_ORANGE, WHITE } from '../../globalStyles';
import { buttonStrings, vaccineStrings } from '../../localization';
import { SECONDS } from '../../utilities/constants';

export const NewSensorStepThreeComponent = ({
  logInterval,
  loggingDelay,
  name,
  code,
  updateName,
  connectToSensor,
  updateCode,
  updateLogInterval,
  updateLoggingDelay,
  exit,
  previousTab,
}) => {
  const withLoadingIndicator = useLoadingIndicator();

  return (
    <TabContainer>
      <WithSpace space={10} horizontal={false} vertical>
        <PaperSection height={200} headerText={vaccineStrings.new_sensor_step_three_title}>
          <EditorRow label={vaccineStrings.sensor_name} Icon={<InfoIcon color={DARKER_GREY} />}>
            <TextEditor size="large" value={name} onChangeText={updateName} />
            <TextEditor label={vaccineStrings.sensor_code} value={code} onChangeText={updateCode} />
          </EditorRow>
          <EditorRow
            label={vaccineStrings.logging_interval}
            Icon={<InfoIcon color={DARKER_GREY} />}
          >
            <DurationEditor
              value={logInterval / SECONDS.ONE_MINUTE}
              label=""
              onChange={updateLogInterval}
            />
          </EditorRow>
        </PaperSection>
      </WithSpace>

      <PaperSection height={130} contentContainerStyle={{ flex: 1 }}>
        <EditorRow label={vaccineStrings.start_logging} Icon={<CalendarIcon color={DARKER_GREY} />}>
          <DateEditor onPress={updateLoggingDelay} date={loggingDelay} />
          <TimeEditor onPress={updateLoggingDelay} time={loggingDelay} />
        </EditorRow>
      </PaperSection>
      <TextWithIcon left size="s" Icon={<HazardIcon color={LIGHT_GREY} />}>
        {vaccineStrings.please_be_in_close_proximity}
      </TextWithIcon>
      <FlexRow flex={1} justifyContent="flex-end" alignItems="flex-end">
        <View style={{ marginRight: 'auto' }}>
          <PageButton text={buttonStrings.back} onPress={previousTab} />
        </View>

        <PageButton text={buttonStrings.cancel} onPress={exit} />
        <Spacer space={20} />
        <PageButton
          text={vaccineStrings.connect}
          style={{ backgroundColor: SUSSOL_ORANGE }}
          textStyle={{ color: WHITE, textTransform: 'capitalize' }}
          onPress={() => withLoadingIndicator(connectToSensor)}
        />
      </FlexRow>
    </TabContainer>
  );
};

const dispatchToProps = dispatch => {
  const updateName = value => dispatch(NewSensorActions.updateName(value));
  const updateCode = value => dispatch(NewSensorActions.updateCode(value));
  const updateLoggingDelay = value => dispatch(NewSensorActions.updateLoggingDelay(value));
  const updateLogInterval = value => dispatch(NewSensorActions.updateLogInterval(value));
  const previousTab = () => dispatch(WizardActions.previousTab());
  const exit = () => dispatch(goBack());
  const connectToSensor = async () => {
    dispatch(NewSensorActions.updateSensor)
      .then(dispatch(NewSensorActions.saveSensor))
      .then(dispatch(gotoSettings()))
      .catch(reason => {
        ToastAndroid.show(reason, ToastAndroid.LONG);
      });
  };

  return {
    previousTab,
    connectToSensor,
    exit,
    updateName,
    updateCode,
    updateLoggingDelay,
    updateLogInterval,
  };
};

const stateToProps = state => {
  const newSensor = selectNewSensor(state);
  const { logInterval, loggingDelay, name, code } = newSensor;

  return { logInterval, loggingDelay, name, code };
};

NewSensorStepThreeComponent.propTypes = {
  logInterval: PropTypes.number.isRequired,
  loggingDelay: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  updateName: PropTypes.func.isRequired,
  updateCode: PropTypes.func.isRequired,
  updateLoggingDelay: PropTypes.func.isRequired,
  updateLogInterval: PropTypes.func.isRequired,
  exit: PropTypes.func.isRequired,
  previousTab: PropTypes.func.isRequired,
  connectToSensor: PropTypes.func.isRequired,
};

export const NewSensorStepThree = connect(
  stateToProps,
  dispatchToProps
)(NewSensorStepThreeComponent);
