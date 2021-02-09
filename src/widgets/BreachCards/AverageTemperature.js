import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { BreachCard } from './BreachCard';

import { vaccineStrings } from '../../localization/index';
import { selectAverageTemperature } from '../../selectors/fridge';

const AverageTemperatureBreachCardComponent = ({ averageTemperature }) => (
  <BreachCard
    headerText={vaccineStrings.average_temperature}
    type="text"
    message={averageTemperature}
  />
);

const stateToProps = state => {
  const averageTemperature = selectAverageTemperature(state);

  return {
    averageTemperature,
  };
};

AverageTemperatureBreachCardComponent.propTypes = {
  averageTemperature: PropTypes.string.isRequired,
};

export const AverageTemperatureBreachCard = connect(stateToProps)(
  AverageTemperatureBreachCardComponent
);
