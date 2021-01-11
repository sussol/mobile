/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text, Pressable } from 'react-native';
import moment from 'moment';

import DateTimePicker from '@react-native-community/datetimepicker';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';

import { DARKER_GREY } from '../../globalStyles';
import { useDatePicker } from '../../hooks';

export const TimeEditor = ({ label, time, onPress, textInputStyle, stepAmount, stepUnit }) => {
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
              placeholderTextColor="red"
              underlineColorAndroid={DARKER_GREY}
              SuffixComponent={<Text>{timeFormat}</Text>}
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
  label: '',
  textInputStyle: { color: DARKER_GREY },
  stepAmount: 1,
  stepUnit: 'minutes',
};

TimeEditor.propTypes = {
  label: PropTypes.string,
  time: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  stepUnit: PropTypes.string,
};
