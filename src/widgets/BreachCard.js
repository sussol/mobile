import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Text, StyleSheet } from 'react-native';
import { DARKER_GREY, APP_FONT_FAMILY, COLD_BREACH_BLUE, DANGER_RED } from '../globalStyles';

import {
  selectAverageTemperature,
  selectColdCumulativeBreach,
  selectNumberOfColdConsecutiveBreaches,
  selectNumberOfHotConsecutiveBreaches,
  selectHotCumulativeBreach,
} from '../selectors/fridge';
import { ColdBreachIcon, HotBreachIcon, Paper } from './index';
import { BreachManHappy } from './BreachManHappy';
import { vaccineStrings } from '../localization/index';

const BreachCardComponent = ({ config }) => {
  const { type, breachCount, headerText, message } = config;
  let icon = null;
  let textStyle = {};
  let text = breachCount?.toString();

  switch (type) {
    case 'cold':
      icon = <ColdBreachIcon color={COLD_BREACH_BLUE} />;
      textStyle = localStyles.coldText;
      break;
    case 'hot':
      icon = <HotBreachIcon color={DANGER_RED} />;
      textStyle = localStyles.hotText;
      break;
    case 'text':
      textStyle = [localStyles.hotText, { color: DARKER_GREY }];
      text = message;
      break;
    default:
      break;
  }

  if (!breachCount && type !== 'text') {
    icon = <BreachManHappy />;
    text = vaccineStrings.no_breaches;
    textStyle = localStyles.noBreachText;
  }

  return (
    <Paper
      headerText={headerText}
      style={localStyles.card}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}
    >
      <Text style={textStyle}>{text}</Text>
      {icon}
    </Paper>
  );
};

BreachCardComponent.defaultProps = {
  breachCount: 0,
  headerText: '',
  message: '',
};
BreachCardComponent.propTypes = {
  breachCount: PropTypes.number,
  config: PropTypes.shape({
    type: PropTypes.string.isRequired,
    breachCount: PropTypes.number,
    headerText: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  headerText: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
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

const stateToProps = (state, props) => {
  const { type } = props;

  switch (type) {
    case 'AVERAGE_TEMPERATURE':
      return {
        config: {
          headerText: vaccineStrings.average_temperature,
          message: selectAverageTemperature(state),
          type: 'text',
        },
      };
    case 'COLD_CONSECUTIVE':
      return {
        config: {
          breachCount: selectNumberOfColdConsecutiveBreaches(state),
          headerText: vaccineStrings.consecutive_breach,
          type: 'cold',
        },
      };
    case 'COLD_CUMULATIVE':
      return {
        config: {
          type: 'cold',
          breachCount: selectColdCumulativeBreach(state),
          headerText: vaccineStrings.cumulative_breach,
        },
      };
    case 'HOT_CONSECUTIVE':
      return {
        config: {
          breachCount: selectNumberOfHotConsecutiveBreaches(state),
          headerText: vaccineStrings.consecutive_breach,
          type: 'hot',
        },
      };
    case 'HOT_CUMULATIVE':
      return {
        config: {
          breachCount: selectHotCumulativeBreach(state),
          headerText: vaccineStrings.cumulative_breach,
          type: 'hot',
        },
      };
    default:
      return {
        config: {
          type: 'unknown',
        },
      };
  }
};

export const BreachCard = connect(stateToProps)(BreachCardComponent);
