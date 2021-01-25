import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ColdBreachIcon, HotBreachIcon } from '../../widgets';
import { EditorRow } from '../../widgets/EditorRow';
import { DurationEditor, TemperatureEditor } from '../../widgets/StepperInputs';
import { COLD_BREACH_BLUE, DANGER_RED } from '../../globalStyles';
import { NewSensorActions } from '../../actions';
import { selectConfigTemperatureThresholds } from '../../selectors/newSensor';
import { SECONDS } from '../../utilities/constants';

export const TYPE_TO_LABEL = {
  HOT_CONSECUTIVE: 'Hot consecutive',
  HOT_CUMULATIVE: 'Hot cumulative',
  COLD_CONSECUTIVE: 'Cold consecutive',
  COLD_CUMULATIVE: 'Cold cumulative',
};

export const BreachConfigRowComponent = ({
  type,
  duration,
  temperature,
  updateDuration,
  updateTemperature,
  threshold,
}) => {
  const isHotBreach = type.includes('HOT');
  const Icon = isHotBreach ? HotBreachIcon : ColdBreachIcon;
  const color = isHotBreach ? DANGER_RED : COLD_BREACH_BLUE;

  return (
    <EditorRow Icon={<Icon color={color} size={20} />} label={TYPE_TO_LABEL[type]}>
      <DurationEditor value={duration / SECONDS.ONE_MINUTE} onChange={updateDuration} />
      <TemperatureEditor
        above={isHotBreach}
        value={temperature}
        onChange={updateTemperature}
        threshold={threshold}
      />
    </EditorRow>
  );
};
const stateToProps = (state, props) => {
  const { type } = props;
  const { newSensor } = state;
  const config = newSensor[type];
  const { duration, temperature } = config;

  const thresholds = selectConfigTemperatureThresholds(state);

  return { duration, temperature, threshold: thresholds[type] };
};

const dispatchToProps = (dispatch, props) => {
  const { type } = props;

  const updateDuration = value => dispatch(NewSensorActions.updateConfig(type, 'duration', value));
  const updateTemperature = value =>
    dispatch(NewSensorActions.updateConfig(type, 'temperature', value));

  return { updateDuration, updateTemperature };
};

BreachConfigRowComponent.propTypes = {
  threshold: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
};

export const BreachConfigRow = connect(stateToProps, dispatchToProps)(BreachConfigRowComponent);
