/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, TextInput } from 'react-native';
import moment from 'moment';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Incrementor } from './Incrementor';

import { DARKER_GREY } from '../../globalStyles';
import { useDatePicker } from '../../hooks';
import { generalStrings } from '../../localization';

const defaultTextInputProps = {
  editable: false,
  style: { color: DARKER_GREY },
};

export const DateEditor = ({
  label,
  date,
  onPress,
  textInputProps,
  stepAmount,
  stepUnit,
  minimumDate,
  maximumDate,
}) => {
  const asMoment = moment(date);
  const formatted = asMoment.format('DD/MM/YYYY');

  const onIncrement = () => onPress(asMoment.add(stepAmount, stepUnit).toDate());
  const onDecrement = () => onPress(asMoment.subtract(stepAmount, stepUnit).toDate());
  const wrappedDatePicker = timestamp => onPress(new Date(timestamp));

  const [datePickerIsOpen, openDatePicker, onPickDate] = useDatePicker(wrappedDatePicker);

  const mergedProps = { ...defaultTextInputProps, ...textInputProps };

  return (
    <>
      <Incrementor
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        label={label}
        Content={
          <Pressable onPress={openDatePicker}>
            <TextInput {...mergedProps} value={formatted} />
          </Pressable>
        }
      />
      {datePickerIsOpen && (
        <DateTimePicker
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          value={date}
          mode="date"
          display="spinner"
          onChange={onPickDate}
        />
      )}
    </>
  );
};

DateEditor.defaultProps = {
  label: generalStrings.date,
  textInputProps: {},
  stepAmount: 1,
  stepUnit: 'day',
  maximumDate: null,
  minimumDate: null,
};

DateEditor.propTypes = {
  label: PropTypes.string,
  date: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  textInputProps: PropTypes.object,
  stepAmount: PropTypes.number,
  stepUnit: PropTypes.string,
  maximumDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.instanceOf(moment)]),
  minimumDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.instanceOf(moment)]),
};
