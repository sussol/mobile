/* eslint-disable react/forbid-prop-types */
import React from 'react';

import PropTypes from 'prop-types';
import { ColdBreachIcon, HotBreachIcon } from '../../widgets';
import { EditorRow } from '../../widgets/EditorRow';
import { DurationEditor, TemperatureEditor } from '../../widgets/StepperInputs';

import { COLD_BREACH_BLUE, DANGER_RED } from '../../globalStyles';
import { SECONDS } from '../../utilities/constants';

export const TYPE_TO_LABEL = {
  HOT_CONSECUTIVE: 'Hot consecutive',
  HOT_CUMULATIVE: 'Hot cumulative',
  COLD_CONSECUTIVE: 'Cold consecutive',
  COLD_CUMULATIVE: 'Cold cumulative',
};

export const BreachConfigRow = React.memo(
  ({
    type,
    duration,
    maximumTemperature,
    minimumTemperature,
    threshold,
    updateDuration,
    updateTemperature,
    containerStyle,
  }) => {
    const isHotBreach = type.includes('HOT');
    const Icon = isHotBreach ? HotBreachIcon : ColdBreachIcon;
    const color = isHotBreach ? DANGER_RED : COLD_BREACH_BLUE;

    return (
      <EditorRow
        containerStyle={containerStyle}
        Icon={<Icon color={color} size={20} />}
        label={TYPE_TO_LABEL[type]}
      >
        <DurationEditor
          value={duration / SECONDS.ONE_MINUTE}
          onChange={value => updateDuration(type, value)}
        />
        <TemperatureEditor
          above={isHotBreach}
          value={isHotBreach ? minimumTemperature : maximumTemperature}
          onChange={value => updateTemperature(type, value)}
          threshold={threshold}
        />
      </EditorRow>
    );
  }
);
BreachConfigRow.defaultProps = {
  containerStyle: {},
  maximumTemperature: 0,
  minimumTemperature: 0,
  duration: 0,
};
BreachConfigRow.propTypes = {
  threshold: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  duration: PropTypes.number,
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
  containerStyle: PropTypes.object,
  maximumTemperature: PropTypes.number,
  minimumTemperature: PropTypes.number,
};
