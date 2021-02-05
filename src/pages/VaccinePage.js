/* eslint-disable react/require-default-props */
/* eslint-disable arrow-body-style */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {
  DataTablePageView,
  ChevronRightIcon,
  PageButton,
  Paper,
  TemperatureIcon,
  Circle,
  FlexRow,
  AlarmClockIcon,
} from '../widgets/index';
import { TextWithIcon } from '../widgets/Typography';

import { generalStrings, buttonStrings } from '../localization';
import { DARKER_GREY, BLACK } from '../globalStyles';
import { gotoFridgeDetailPage, gotoNewSensorPage } from '../navigation/actions';
import { AfterInteractions } from '../widgets/AfterInteractions';
import { SensorHeader } from '../widgets/SensorHeader';
import { selectSensors } from '../selectors/Entities/sensor';
import temperature from '../utilities/temperature';

const formatDate = date => (date ? moment(date).fromNow() : generalStrings.not_available);

const FridgeDisplay = ({ sensor, toFridgeDetail }) => {
  const { id, macAddress, currentTemperature, mostRecentBreachTime, locationID } = sensor;

  return (
    <Paper
      Header={<SensorHeader showTitle showCog sensor={sensor} />}
      contentContainerStyle={localStyles.fridgePaperContentContainer}
    >
      <TouchableOpacity onPress={() => toFridgeDetail(locationID)}>
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
            {temperature(currentTemperature).format()}
          </TextWithIcon>
          <TextWithIcon
            left
            containerStyle={localStyles.fridgeDetail}
            size="ms"
            Icon={<AlarmClockIcon color={DARKER_GREY} />}
          >
            {formatDate(mostRecentBreachTime)}
          </TextWithIcon>

          <ChevronRightIcon color={BLACK} style={{ alignSelf: 'center' }} />
        </FlexRow>
      </TouchableOpacity>
    </Paper>
  );
};

FridgeDisplay.propTypes = {
  sensor: PropTypes.object.isRequired,
  toFridgeDetail: PropTypes.func.isRequired,
};

export const VaccinePageComponent = ({ sensors, toNewSensorPage, toFridgeDetail }) => (
  <DataTablePageView
    captureUncaughtGestures={false}
    style={{ paddingHorizontal: 20, paddingVertical: 30 }}
  >
    <FlexRow style={{ justifyContent: 'flex-end', marginBottom: 10 }}>
      <PageButton text={buttonStrings.add_sensor} onPress={toNewSensorPage} />
    </FlexRow>
    <AfterInteractions placeholder={null}>
      <Animatable.View animation="fadeIn" duration={500} useNativeDriver>
        <FlatList
          renderItem={({ item }) => <FridgeDisplay sensor={item} toFridgeDetail={toFridgeDetail} />}
          data={sensors}
        />
      </Animatable.View>
    </AfterInteractions>
  </DataTablePageView>
);

VaccinePageComponent.defaultProps = {
  sensors: null,
};

VaccinePageComponent.propTypes = {
  sensors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  toFridgeDetail: PropTypes.func.isRequired,
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
    width: 140,
  },
  fridgePaperContentContainer: {
    flex: 2,
    flexDirection: 'column',
  },
});

const stateToProps = state => {
  const { fridge } = state;
  const { fridges } = fridge;

  const sensors = selectSensors(state);
  return { fridges, sensors };
};

const dispatchToProps = dispatch => ({
  toFridgeDetail: fridge => dispatch(gotoFridgeDetailPage(fridge)),
  toNewSensorPage: () => dispatch(gotoNewSensorPage()),
});

export const VaccinePage = connect(stateToProps, dispatchToProps)(VaccinePageComponent);
