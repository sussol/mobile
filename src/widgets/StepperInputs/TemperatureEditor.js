/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { generalStrings } from '../../localization';

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
  maximum,
  minimum,
}) => {
  const formatted = keepInRange(value, minimum, maximum).toFixed(2);

  const onIncrement = () => onChange(value + stepAmount);
  const onDecrement = () => onChange(value - stepAmount);

  return (
    <>
      <Incrementor
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        label={label}
        Content={
          <TextInputWithAffix
            editable={false}
            SuffixComponent={<Text style={suffixTextStyle}>{`${'\u00B0'}Celsius`}</Text>}
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
    width: 40,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
  },
  suffixTextStyle: { fontSize: 12, color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, width: 50 },
  stepAmount: 0.5,
  maximum: 999,
  minimum: 1,
};

TemperatureEditor.propTypes = {
  minimum: PropTypes.number,
  maximum: PropTypes.number,
  label: PropTypes.string,
  textInputStyle: PropTypes.object,
  suffixTextStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
