/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text, Pressable } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { useDatePicker } from '../../hooks';
import { generalStrings } from '../../localization';

export const TimeEditor = ({
  label,
  time,
  onPress,
  textInputStyle,
  suffixTextStyle,
  stepAmount,
  stepUnit,
}) => {
  const asMoment = moment(time);
  const formatted = asMoment.format('hh:mm');
  const timeFormat = asMoment.format('a');

  const onIncrement = () => onPress(asMoment.add(stepAmount, stepUnit).toDate());
  const onDecrement = () => onPress(asMoment.subtract(stepAmount, stepUnit).toDate());
  const wrappedTimePicker = timestamp => onPress(new Date(timestamp));

  const [timePickerIsOpen, openTimePicker, onPickTime] = useDatePicker(wrappedTimePicker);

  return (
    <>
      <Incrementor
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        label={label}
        Content={
          <Pressable onPress={openTimePicker}>
            <TextInputWithAffix
              editable={false}
              SuffixComponent={<Text style={suffixTextStyle}>{timeFormat}</Text>}
              style={textInputStyle}
              value={formatted}
            />
          </Pressable>
        }
      />
      {timePickerIsOpen && (
        <DateTimePicker value={time} mode="time" display="spinner" onChange={onPickTime} />
      )}
    </>
  );
};

TimeEditor.defaultProps = {
  label: generalStrings.time,
  textInputStyle: { color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, width: 50 },
  suffixTextStyle: { color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, fontSize: 12, width: 50 },
  stepAmount: 1,
  stepUnit: 'minutes',
};

TimeEditor.propTypes = {
  suffixTextStyle: PropTypes.object,
  label: PropTypes.string,
  time: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  stepUnit: PropTypes.string,
};
