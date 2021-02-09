import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { BreachCard } from './BreachCard';

import { vaccineStrings } from '../../localization/index';
import { selectNumberOfHotConsecutiveBreaches } from '../../selectors/fridge';

const HotConsecutiveBreachCardComponent = ({ numberOfHotBreaches }) => (
  <BreachCard
    headerText={vaccineStrings.consecutive_breach}
    breachCount={numberOfHotBreaches}
    type="hot"
  />
);

const stateToProps = state => {
  const numberOfHotBreaches = selectNumberOfHotConsecutiveBreaches(state);

  return {
    numberOfHotBreaches,
  };
};

HotConsecutiveBreachCardComponent.propTypes = {
  numberOfHotBreaches: PropTypes.number.isRequired,
};

export const HotConsecutiveBreachCard = connect(stateToProps)(HotConsecutiveBreachCardComponent);
