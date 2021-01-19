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
import { IconButton } from './IconButton';
import { DARK_GREY } from '../globalStyles/index';

/**
 * Shows an Icon that is pressable and opens a date picker. Handle result with
 * callback "onDateChanged".
 *
 * @prop {Node} initialValue  Initial date value to display in picker
 * @prop {Func} onDateChanged Callback to handle output of selected date.
 *                            Should take one parameter, a timestamp.
 * @prop {Func} maximumDate Maximum date selectable.
 * @prop {Func} minimumDate Minimum date selectable.
 * @prop {Boolean} isCircle Should the Icon have a Circle background rendered.
 */

export const DatePickerButton = ({
  initialValue,
  onDateChanged,
  maximumDate,
  minimumDate,
  isCircle,
}) => {
  const [datePickerIsOpen, openDatePicker, datePickerCallback] = useDatePicker(onDateChanged);
  const button = isCircle ? (
    <CircleButton IconComponent={CalendarIcon} onPress={openDatePicker} />
  ) : (
    <IconButton Icon={<CalendarIcon color={DARK_GREY} />} onPress={openDatePicker} />
  );

  return (
    <>
      {button}
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
  isCircle: true,
};

DatePickerButton.propTypes = {
  initialValue: PropTypes.instanceOf(Date).isRequired,
  onDateChanged: PropTypes.func.isRequired,
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
  isCircle: PropTypes.bool,
};
