import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { BreachCard } from './BreachCard';

import { vaccineStrings } from '../../localization/index';
import { selectColdCumulativeBreach } from '../../selectors/fridge';

const ColdCumulativeBreachCardComponent = ({ coldCumulativeBreach }) => (
  <BreachCard
    headerText={vaccineStrings.cumulative_breach}
    breachCount={coldCumulativeBreach}
    type="cold"
  />
);

const stateToProps = state => {
  const coldCumulativeBreach = selectColdCumulativeBreach(state);

  return {
    coldCumulativeBreach,
  };
};
ColdCumulativeBreachCardComponent.defaultProps = {
  coldCumulativeBreach: null,
};

ColdCumulativeBreachCardComponent.propTypes = {
  coldCumulativeBreach: PropTypes.string,
};

export const ColdCumulativeBreachCard = connect(stateToProps)(ColdCumulativeBreachCardComponent);
