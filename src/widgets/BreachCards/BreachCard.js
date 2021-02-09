import React from 'react';
import PropTypes from 'prop-types';

import { Text, StyleSheet } from 'react-native';
import { DARKER_GREY, APP_FONT_FAMILY, COLD_BREACH_BLUE, DANGER_RED } from '../../globalStyles';

import { ColdBreachIcon, HotBreachIcon, Paper } from '..';
import { BreachManHappy } from '../BreachManHappy';
import { vaccineStrings } from '../../localization/index';

export const BreachCard = ({ type, breachCount, headerText, message }) => {
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

BreachCard.defaultProps = {
  breachCount: 0,
  message: '',
};
BreachCard.propTypes = {
  breachCount: PropTypes.number,
  headerText: PropTypes.string.isRequired,
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
