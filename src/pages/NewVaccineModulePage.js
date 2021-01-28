import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  DataTablePageView,
  ChevronRightIcon,
  PageButton,
  Paper,
  BatteryIcon,
  DownloadIcon,
  TemperatureIcon,
  IconButton,
  LightbulbIcon,
  WifiIcon,
  CogIcon,
  Circle,
  FlexRow,
  AlarmClockIcon,
} from '../widgets/index';
import { TextWithIcon } from '../widgets/Typography';

import { buttonStrings } from '../localization';
import { DARKER_GREY, BLACK, FINALISE_GREEN } from '../globalStyles';
import { VaccineActions } from '../actions/index';
import { gotoEditSensorPage, gotoFridgeDetailPage, gotoNewSensorPage } from '../navigation/actions';

const formatDate = date => moment(date).fromNow();
const formatTemperature = temperature => `${Math.round(temperature * 10) / 10}°C`;

const FridgeDisplay = ({ fridge, blinkSensor, toFridgeDetail, toEditSensorPage }) => {
  const { description, sensors } = fridge;
  const [sensor] = sensors;
  const header = (
    <>
      <TextWithIcon
        left
        size="ms"
        textStyle={{ textTransform: 'uppercase' }}
        containerStyle={{ flex: 1 }}
        Icon={<Circle size={20} backgroundColor={FINALISE_GREEN} />}
      >
        {description}
      </TextWithIcon>
      <IconButton Icon={<DownloadIcon color={BLACK} />} containerStyle={localStyles.iconButton} />
      <IconButton
        Icon={<LightbulbIcon color={BLACK} />}
        onPress={() => blinkSensor(sensor.macAddress)}
        containerStyle={localStyles.iconButton}
      />
      <IconButton
        Icon={<CogIcon color={BLACK} />}
        onPress={() => toEditSensorPage(sensor)}
        containerStyle={localStyles.iconButton}
      />
    </>
  );

  return (
    <Paper
      // macAddress passed to fridgeHeader is quite naff. The settings page for the "fridge" is
      // actually for a sensor, assuming 1 sensor per fridge.
      Header={header}
      contentContainerStyle={localStyles.fridgePaperContentContainer}
    >
      {sensors.map(({ id, macAddress, batteryLevel, logs, breaches }) => {
        const mostRecentLog = logs.sorted('timestamp', true)[0];
        const lastSyncMessage = mostRecentLog ? formatDate(mostRecentLog.timestamp) : 'No logs yet';
        const temperature = mostRecentLog ? formatTemperature(mostRecentLog.temperature) : 'N/A';
        const mostRecentBreach = breaches?.sorted('endTimestamp', true)[0];
        const lastBreachMessage = mostRecentBreach
          ? formatDate(mostRecentBreach.endTimestamp)
          : 'Never!';

        return (
          <FlexRow key={id}>
            <TextWithIcon left size="ms" containerStyle={{ flex: 1 }} Icon={<Circle size={20} />}>
              {macAddress}
            </TextWithIcon>
            <TextWithIcon
              left
              size="ms"
              containerStyle={localStyles.fridgeDetail}
              Icon={<TemperatureIcon color={DARKER_GREY} />}
            >
              {temperature}
            </TextWithIcon>
            <TextWithIcon
              left
              containerStyle={localStyles.fridgeDetail}
              size="ms"
              Icon={<AlarmClockIcon color={DARKER_GREY} />}
            >
              {lastBreachMessage}
            </TextWithIcon>
            <TextWithIcon
              left
              size="ms"
              containerStyle={localStyles.fridgeDetail}
              Icon={<WifiIcon color={DARKER_GREY} />}
            >
              {lastSyncMessage}
            </TextWithIcon>
            <TextWithIcon
              left
              size="ms"
              containerStyle={localStyles.fridgeDetail}
              Icon={<BatteryIcon color={DARKER_GREY} />}
            >
              {`${batteryLevel}%`}
            </TextWithIcon>
            <IconButton
              Icon={<ChevronRightIcon color={BLACK} />}
              onPress={() => toFridgeDetail(fridge)}
              containerStyle={localStyles.iconButton}
            />
          </FlexRow>
        );
      })}
    </Paper>
  );
};
FridgeDisplay.defaultProps = {
  fridge: null,
};
FridgeDisplay.propTypes = {
  fridge: PropTypes.objectOf({
    id: PropTypes.string,
    description: PropTypes.string,
    sensors: PropTypes.array,
  }),
  blinkSensor: PropTypes.func.isRequired,
  toFridgeDetail: PropTypes.func.isRequired,
  toEditSensorPage: PropTypes.func.isRequired,
};

export const NewVaccineModulePageComponent = ({ fridges, toNewSensorPage, ...dispatchers }) => (
  <DataTablePageView style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
    <FlexRow style={{ justifyContent: 'flex-end', marginBottom: 10 }}>
      <PageButton text={buttonStrings.add_sensor} onPress={toNewSensorPage} />
    </FlexRow>
    <FlatList
      renderItem={({ item }) => <FridgeDisplay fridge={item} {...dispatchers} />}
      data={fridges}
    />
  </DataTablePageView>
);
NewVaccineModulePageComponent.defaultProps = {
  fridges: null,
};
NewVaccineModulePageComponent.propTypes = {
  fridges: PropTypes.arrayOf(PropTypes.object),
  blinkSensor: PropTypes.func.isRequired,
  toFridgeDetail: PropTypes.func.isRequired,
  toEditSensorPage: PropTypes.func.isRequired,
  toNewSensorPage: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  iconButton: {
    flexBasis: 50,
    justifyContent: 'center',
  },
  fridgeDetail: {
    flex: 0,
    height: 60,
    paddingHorizontal: 10,
  },
  fridgePaperContentContainer: {
    flex: 2,
    flexDirection: 'column',
  },
});

const stateToProps = state => {
  const { fridge } = state;
  const { fridges } = fridge;
  return { fridges };
};

const dispatchToProps = dispatch => ({
  blinkSensor: macAddress => dispatch(VaccineActions.startSensorBlink(macAddress)),
  toFridgeDetail: fridge => dispatch(gotoFridgeDetailPage(fridge)),
  toEditSensorPage: sensor => dispatch(gotoEditSensorPage(sensor)),
  toNewSensorPage: () => dispatch(gotoNewSensorPage()),
});

export const NewVaccineModulePage = connect(
  stateToProps,
  dispatchToProps
)(NewVaccineModulePageComponent);
