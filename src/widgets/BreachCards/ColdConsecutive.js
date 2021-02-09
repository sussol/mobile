import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { BreachCard } from './BreachCard';

import { vaccineStrings } from '../../localization/index';
import { selectNumberOfColdConsecutiveBreaches } from '../../selectors/fridge';

const ColdConsecutiveBreachCardComponent = ({ numberOfColdBreaches }) => (
  <BreachCard
    headerText={vaccineStrings.consecutive_breach}
    breachCount={numberOfColdBreaches}
    type="cold"
  />
);

const stateToProps = state => {
  const numberOfColdBreaches = selectNumberOfColdConsecutiveBreaches(state);

  return {
    numberOfColdBreaches,
  };
};

ColdConsecutiveBreachCardComponent.propTypes = {
  numberOfColdBreaches: PropTypes.number.isRequired,
};

export const ColdConsecutiveBreachCard = connect(stateToProps)(ColdConsecutiveBreachCardComponent);
