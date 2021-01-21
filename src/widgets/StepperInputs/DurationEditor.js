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

export const DurationEditor = ({
  value,
  onChange,
  label,
  textInputStyle,
  suffixTextStyle,
  stepAmount,
}) => {
  const formatted = String(keepInRange(value, 1, 999));

  const onIncrement = () => onChange(keepInRange(value + stepAmount, 1, 999));
  const onDecrement = () => onChange(keepInRange(value - stepAmount, 1, 999));

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
  label: 'Duration',
  textInputStyle: {
    color: DARKER_GREY,
    width: 40,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
  },
  suffixTextStyle: { color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, fontSize: 12, width: 50 },
  stepAmount: 1,
};

DurationEditor.propTypes = {
  label: PropTypes.string,
  textInputStyle: PropTypes.object,
  suffixTextStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
