/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';
import { DARKER_GREY } from '../../globalStyles';
import { generalStrings } from '../../localization';

const keepInRange = (num, min, max) => {
  const temp = Math.min(num, max);
  return Math.max(temp, min);
};

export const DurationEditor = ({
  value,
  onChange,
  label,
  textInputStyle,
  suffixTextStyle,
  stepAmount,
}) => {
  const formatted = String(keepInRange(value, 1, 999));

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
            SuffixComponent={<Text style={suffixTextStyle}>{generalStrings.minutes}</Text>}
            style={textInputStyle}
            value={formatted}
          />
        }
      />
    </>
  );
};

DurationEditor.defaultProps = {
  label: '',
  textInputStyle: { color: DARKER_GREY, minWidth: 60, textAlign: 'right' },
  suffixTextStyle: { color: DARKER_GREY },
  stepAmount: 5,
};

DurationEditor.propTypes = {
  label: PropTypes.string,
  textInputStyle: PropTypes.object,
  suffixTextStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
