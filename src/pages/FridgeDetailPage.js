/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

import { DateRangeSelector } from '../widgets/DateRangeSelector';
import {
  CardDetail,
  ColdBreachIcon,
  DataTablePageView,
  FlexRow,
  HotBreachIcon,
  PaperSection,
  SpacedChildren,
} from '../widgets';
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

const CardText = ({ children, color, small }) => (
  <Text style={{ color, fontSize: small ? 12 : 50, fontFamily: APP_FONT_FAMILY }}>{children}</Text>
);

CardText.defaultProps = { small: false };

CardText.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  small: PropTypes.bool,
};

const BreachCard = ({ content, type }) => {
  const color = type === 'HOT_CUMULATIVE' ? DANGER_RED : COLD_BREACH_BLUE;
  const Icon = type === 'HOT_CUMULATIVE' ? HotBreachIcon : ColdBreachIcon;

  const header = type.includes('CUMULATIVE')
    ? vaccineStrings.cumulative_breach
    : vaccineStrings.consecutive_breach;

  return (
    <CardDetail
      headerText={header}
      Content={content ? <CardText color={color}>{content}</CardText> : <NoBreachMan />}
      Footer={
        content ? (
          <Icon color={color} />
        ) : (
          <CardText color={color} small>
            {vaccineStrings.no_breaches}
          </CardText>
        )
      }
    />
  );
};

BreachCard.defaultProps = {
  content: null,
};

BreachCard.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.oneOf([
    'COLD_CUMULATIVE',
    'COLD_CONSECUTIVE',
    'HOT_CONSECUTIVE',
    'HOT_CUMULATIVE',
  ]).isRequired,
};

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
      <SpacedChildren space={30} after vertical horizontal={false}>
        <DateRangeSelector
          containerStyle={localStyles.datePickerContainer}
          initialStartDate={fromDate}
          initialEndDate={toDate}
          onChangeToDate={onChangeToDate}
          onChangeFromDate={onChangeFromDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />

        <PaperSection height={280}>
          <AfterInteractions>
            <VaccineChart
              breaches={[breaches[0]]}
              minLine={minLine}
              maxLine={maxLine}
              minDomain={minDomain}
              maxDomain={maxDomain}
            />
          </AfterInteractions>
        </PaperSection>

        <Animatable.View animation="fadeIn" duration={3000} useNativeDriver>
          <FlexRow justifyContent="space-between">
            <BreachCard content={coldCumulativeBreach} type="COLD_CUMULATIVE" />
            <BreachCard numberOfBreaches={numberOfColdBreaches} type="COLD_CONSECUTIVE" />

            <CardDetail
              headerText={vaccineStrings.average_temperature}
              Content={<CardText color={DARKER_GREY}>{averageTemperature}</CardText>}
            />

            <BreachCard content={hotCumulativeBreach} type="HOT_CUMULATIVE" />
            <BreachCard content={numberOfHotBreaches} type="HOT_CONSECUTIVE" />
          </FlexRow>
        </Animatable.View>
      </SpacedChildren>
    </View>
  </DataTablePageView>
);

const localStyles = {
  container: { padding: 50, flex: 1, backgroundColor: BLUE_WHITE },
  datePickerContainer: { width: 250, borderRadius: 50, height: 50 },
};

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
