/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';

import { CircleButton } from './CircleButton';
import { CalendarIcon } from './icons';

import { useDatePicker } from '../hooks/useDatePicker';

export const DatePickerButton = ({ initialValue, onDateChanged, maximumDate, minimumDate }) => {
  const [datePickerIsOpen, openDatePicker, datePickerCallback] = useDatePicker(onDateChanged);
  return (
    <>
      <CircleButton IconComponent={CalendarIcon} onPress={openDatePicker} />
      {datePickerIsOpen && (
        <DateTimePicker
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={datePickerCallback}
          mode="date"
          display="spinner"
          value={initialValue}
        />
      )}
    </>
  );
};

DatePickerButton.defaultProps = {
  minimumDate: undefined,
  maximumDate: undefined,
};

DatePickerButton.propTypes = {
  initialValue: PropTypes.instanceOf(Date).isRequired,
  onDateChanged: PropTypes.func.isRequired,
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
};
