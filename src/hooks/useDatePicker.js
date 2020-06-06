/* eslint-disable import/prefer-default-export */
import React from 'react';

/**
 * Hook to simplify the use of the native date picker component by unwrapping
 * the callback event and firing the callback only when the date is changing,
 * providing a value to conditionally render the native picker and a callback
 * to set the render value.
 *
 * Pass an onChange callback which will be called when a new date is selected
 * from the datepicker and not when cancelled or dismissed, with a JS date object
 * rather than a nativeEvent.
 *
 * @param  {Func}  callback callback
 * @return {Array} [
 * datePickerIsOpen: boolean indicator whether the date picker is open.
 * openDatePicker: Callback function to set the datePickerIsOpen to true.
 * datePickerCallback: Wrapped callback, triggered on changing the date in the picker,
 * returning a JS date object.
 * ]
 */
export const useDatePicker = onChangeCallback => {
  const [datePickerIsOpen, setDatePickerIsOpen] = React.useState(false);

  const datePickerCallback = React.useCallback(
    event => {
      setDatePickerIsOpen(false);
      const { type, nativeEvent } = event;
      if (type === 'set' && onChangeCallback) {
        const { timestamp } = nativeEvent;

        onChangeCallback(timestamp);
      }
    },
    [onChangeCallback]
  );

  const openDatePicker = React.useCallback(() => {
    setDatePickerIsOpen(true);
  }, []);

  return [datePickerIsOpen, openDatePicker, datePickerCallback];
};
