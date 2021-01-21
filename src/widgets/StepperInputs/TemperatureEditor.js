/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { generalStrings } from '../../localization';
import { FlexColumn } from '../FlexColumn';
import temperature from '../../utilities/temperature';

const keepInRange = (num, min, max) => {
  const temp = Math.min(num, max);
  return Math.max(temp, min);
};

export const TemperatureEditor = ({
  value,
  onChange,
  label,
  textInputStyle,
  suffixTextStyle,
  stepAmount,
  threshold,
  above,
  belowMinimum,
  aboveMaximum,
}) => {
  const minimum = above ? threshold : belowMinimum;
  const maximum = above ? aboveMaximum : threshold;

  const formatted = keepInRange(value, minimum, maximum).toFixed(2);

  const onIncrement = () =>
    onChange(keepInRange(temperature(value + stepAmount).temperature(), minimum, maximum));
  const onDecrement = () =>
    onChange(keepInRange(temperature(value - stepAmount).temperature(), minimum, maximum));

  return (
    <>
      <Incrementor
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        label={label}
        Content={
          <TextInputWithAffix
            editable={false}
            SuffixComponent={
              <FlexColumn style={{ marginTop: 12 }}>
                <Text style={suffixTextStyle}>{`${'\u00B0'}Celsius`}</Text>
                <Text style={{ fontSize: 10 }}> and below</Text>
              </FlexColumn>
            }
            style={textInputStyle}
            value={formatted}
          />
        }
      />
    </>
  );
};

TemperatureEditor.defaultProps = {
  label: generalStrings.temp,
  textInputStyle: {
    fontSize: 14,
    color: DARKER_GREY,
    width: 50,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
  },
  suffixTextStyle: { fontSize: 12, color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, width: 50 },
  stepAmount: 0.5,
  above: true,
  belowMinimum: -30,
  aboveMaximum: 999,
};

TemperatureEditor.propTypes = {
  above: PropTypes.bool,
  threshold: PropTypes.number.isRequired,
  label: PropTypes.string,
  textInputStyle: PropTypes.object,
  suffixTextStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  belowMinimum: PropTypes.number,
  aboveMaximum: PropTypes.number,
};
