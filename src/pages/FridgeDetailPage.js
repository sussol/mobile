/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Text, View, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

import { DateRangeSelector } from '../widgets/DateRangeSelector';
import { ColdBreachIcon, DataTablePageView, FlexRow, HotBreachIcon, Paper } from '../widgets';
import { VaccineChart } from '../widgets/VaccineChart';
import { NoBreachMan } from '../widgets/NoBreachMan';
import { FridgeActions } from '../actions/FridgeActions';
import { AfterInteractions } from '../widgets/AfterInteractions';

import {
  selectAverageTemperature,
  selectBreaches,
  selectColdCumulativeBreach,
  selectHotCumulativeBreach,
  selectLeastRecentTemperatureLogDate,
  selectMinAndMaxDomains,
  selectMinAndMaxLogs,
  selectMostRecentTemperatureLogDate,
  selectNumberOfColdConsecutiveBreaches,
  selectNumberOfHotConsecutiveBreaches,
  selectTemperatureLogsFromDate,
  selectTemperatureLogsToDate,
} from '../selectors/fridge';

import {
  DARKER_GREY,
  APP_FONT_FAMILY,
  BLUE_WHITE,
  COLD_BREACH_BLUE,
  DANGER_RED,
} from '../globalStyles';
import { vaccineStrings } from '../localization/index';

const NoBreachMessage = () => (
  <>
    <NoBreachMan />
    <Text style={localStyles.noBreachText}>{vaccineStrings.no_breaches}</Text>
  </>
);

const BreachCard = props => (
  <Paper
    {...props}
    style={localStyles.card}
    contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}
  />
);

export const FridgeDetailPageComponent = ({
  breaches,
  minLine,
  maxLine,
  minDomain,
  maxDomain,
  onChangeToDate,
  onChangeFromDate,
  fromDate,
  toDate,
  minimumDate,
  maximumDate,
  numberOfHotBreaches,
  numberOfColdBreaches,
  hotCumulativeBreach,
  coldCumulativeBreach,
  averageTemperature,
}) => (
  <DataTablePageView>
    <View style={localStyles.container}>
      <DateRangeSelector
        containerStyle={localStyles.datePickerContainer}
        initialStartDate={fromDate}
        initialEndDate={toDate}
        onChangeToDate={onChangeToDate}
        onChangeFromDate={onChangeFromDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />

      <Paper style={{ flex: 1 }} contentContainerStyle={{ flex: 1, marginTop: 20 }}>
        <AfterInteractions>
          <VaccineChart
            breaches={[breaches[0]]}
            minLine={minLine}
            maxLine={maxLine}
            minDomain={minDomain}
            maxDomain={maxDomain}
          />
        </AfterInteractions>
      </Paper>

      <Animatable.View animation="fadeIn" duration={3000} useNativeDriver>
        <FlexRow>
          <BreachCard headerText={vaccineStrings.cumulative_breach}>
            {coldCumulativeBreach ? (
              <>
                <Text style={localStyles.coldText}>{coldCumulativeBreach}</Text>
                <ColdBreachIcon />
              </>
            ) : (
              <NoBreachMessage />
            )}
          </BreachCard>

          <BreachCard headerText={vaccineStrings.consecutive_breach}>
            {numberOfColdBreaches ? (
              <>
                <Text style={localStyles.coldText}>{numberOfColdBreaches}</Text>
                <ColdBreachIcon />
              </>
            ) : (
              <NoBreachMessage />
            )}
          </BreachCard>

          <BreachCard headerText={vaccineStrings.average_temperature}>
            <Text style={[localStyles.hotText, { color: DARKER_GREY }]}>{averageTemperature}</Text>
          </BreachCard>

          <BreachCard headerText={vaccineStrings.cumulative_breach}>
            {hotCumulativeBreach ? (
              <>
                <Text style={localStyles.hotText}>{hotCumulativeBreach}</Text>
                <HotBreachIcon />
              </>
            ) : (
              <NoBreachMessage />
            )}
          </BreachCard>

          <BreachCard headerText={vaccineStrings.consecutive_breach}>
            {numberOfHotBreaches ? (
              <>
                <Text style={localStyles.hotText}>{numberOfHotBreaches}</Text>
                <HotBreachIcon />
              </>
            ) : (
              <NoBreachMessage />
            )}
          </BreachCard>
        </FlexRow>
      </Animatable.View>
    </View>
  </DataTablePageView>
);

const localStyles = StyleSheet.create({
  container: { padding: 50, flex: 1, backgroundColor: BLUE_WHITE },
  datePickerContainer: { width: 250, borderRadius: 50, height: 50 },
  card: { flex: 1 },
  hotText: {
    color: DANGER_RED,
    fontSize: 50,
    fontFamily: APP_FONT_FAMILY,
  },
  coldText: {
    color: COLD_BREACH_BLUE,
    fontSize: 50,
    fontFamily: APP_FONT_FAMILY,
  },
  noBreachText: {
    fontSize: 12,
    color: DARKER_GREY,
    fontFamily: APP_FONT_FAMILY,
  },
});

const stateToProps = state => {
  const { fridge } = state;
  const { code } = fridge;

  const breaches = selectBreaches(state);
  const { minLine, maxLine } = selectMinAndMaxLogs(state);
  const { minDomain, maxDomain } = selectMinAndMaxDomains(state);
  const fromDate = selectTemperatureLogsFromDate(state);
  const toDate = selectTemperatureLogsToDate(state);
  const minimumDate = selectLeastRecentTemperatureLogDate(state);
  const maximumDate = selectMostRecentTemperatureLogDate(state);
  const numberOfHotBreaches = selectNumberOfHotConsecutiveBreaches(state);
  const numberOfColdBreaches = selectNumberOfColdConsecutiveBreaches(state);
  const averageTemperature = selectAverageTemperature(state);
  const hotCumulativeBreach = selectHotCumulativeBreach(state);
  const coldCumulativeBreach = selectColdCumulativeBreach(state);

  return {
    averageTemperature,
    coldCumulativeBreach,
    hotCumulativeBreach,
    numberOfColdBreaches,
    numberOfHotBreaches,
    code,
    breaches,
    minLine,
    maxLine,
    minDomain,
    maxDomain,
    fromDate,
    toDate,
    minimumDate,
    maximumDate,
  };
};

const dispatchToProps = dispatch => ({
  onChangeToDate: date => dispatch(FridgeActions.changeToDate(date)),
  onChangeFromDate: date => dispatch(FridgeActions.changeFromDate(date)),
});

FridgeDetailPageComponent.defaultProps = {};

FridgeDetailPageComponent.propTypes = {
  breaches: PropTypes.array.isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  minDomain: PropTypes.number.isRequired,
  maxDomain: PropTypes.number.isRequired,
  onChangeToDate: PropTypes.func.isRequired,
  onChangeFromDate: PropTypes.func.isRequired,
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  minimumDate: PropTypes.instanceOf(Date).isRequired,
  maximumDate: PropTypes.instanceOf(Date).isRequired,
  numberOfHotBreaches: PropTypes.number.isRequired,
  numberOfColdBreaches: PropTypes.number.isRequired,
  hotCumulativeBreach: PropTypes.string.isRequired,
  coldCumulativeBreach: PropTypes.string.isRequired,
  averageTemperature: PropTypes.number.isRequired,
};

export const FridgeDetailPage = connect(stateToProps, dispatchToProps)(FridgeDetailPageComponent);
