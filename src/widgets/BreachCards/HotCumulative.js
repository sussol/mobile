import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { BreachCard } from './BreachCard';

import { vaccineStrings } from '../../localization/index';
import { selectHotCumulativeBreach } from '../../selectors/fridge';

const HotCumulativeBreachCardComponent = ({ hotCumulativeBreach }) => (
  <BreachCard
    headerText={vaccineStrings.cumulative_breach}
    breachCount={hotCumulativeBreach}
    type="hot"
  />
);

const stateToProps = state => {
  const hotCumulativeBreach = selectHotCumulativeBreach(state);

  return {
    hotCumulativeBreach,
  };
};
HotCumulativeBreachCardComponent.defaultProps = {
  hotCumulativeBreach: null,
};

HotCumulativeBreachCardComponent.propTypes = {
  hotCumulativeBreach: PropTypes.string,
};

export const HotCumulativeBreachCard = connect(stateToProps)(HotCumulativeBreachCardComponent);
