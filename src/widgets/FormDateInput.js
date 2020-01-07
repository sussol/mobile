/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Text, StyleSheet, TextInput } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';

import { FlexColumn } from './FlexColumn';
import { FlexRow } from './FlexRow';

import { APP_FONT_FAMILY, SUSSOL_ORANGE, DARKER_GREY, FINALISED_RED } from '../globalStyles';
import { CalendarIcon } from './icons';
import { CircleButton } from './CircleButton';

export const FormDateInput = React.forwardRef(
  (
    {
      value,
      isRequired,
      onValidate,
      onChangeDate,
      label,
      invalidMessage,
      invalidMessageStyle,
      isRequiredStyle,
      labelStyle,
      textInputStyle,
      placeholder,
      placeholderTextColor,
      underlineColorAndroid,
      onSubmit,
    },
    ref
  ) => {
    const initialValue = onValidate(value) ? new Date(value) : new Date();

    const [inputState, setInputState] = React.useState({
      isValid: true,
      inputValue: moment(initialValue).format('DD/MM/YYYY'),
      pickerSeedValue: initialValue,
      datePickerOpen: false,
    });

    const { inputValue, isValid, pickerSeedValue, datePickerOpen } = inputState;

    const IsRequiredLabel = () =>
      (isRequired && <Text style={isRequiredStyle}>Is Required</Text>) || null;

    const InvalidMessageLabel = () =>
      !isValid && <Text style={invalidMessageStyle}>{invalidMessage}</Text>;

    const onUpdate = (newValue, validity = true, pickerVisibility = false) => {
      const newState = {
        isValid: validity,
        inputValue: newValue,
        pickerSeedValue: validity ? moment(newValue, 'DD/MM/YYYY').toDate() : new Date(),
        datePickerOpen: pickerVisibility,
      };
      setInputState(newState);
      onChangeDate(newValue);
    };

    // When changing the value of the input, check the new validity and set the new input.
    // Do not restrict input, but provide feedback to the user.
    const onChangeTextCallback = React.useCallback(
      newValue => {
        const newValueIsValid = onValidate ? onValidate(newValue) : true;
        onUpdate(newValue, newValueIsValid);
      },
      [onValidate]
    );

    const onChangeDates = ({ nativeEvent }) => {
      const { timestamp } = nativeEvent;
      if (!timestamp) return;
      const newDate = moment(new Date(timestamp)).format('DD/MM/YYYY');
      onUpdate(newDate, true);
    };

    const openDatePicker = () => setInputState(state => ({ ...state, datePickerOpen: true }));

    const onSubmitEditing = React.useCallback(event => onSubmit?.(event.nativeEvent.text), [
      onSubmit,
    ]);

    return (
      <FlexRow flex={1}>
        <FlexColumn flex={1}>
          <FlexRow flex={1}>
            <Text style={labelStyle}>{label}</Text>
            <IsRequiredLabel />
          </FlexRow>
          <FlexRow flex={1}>
            <TextInput
              ref={ref}
              style={textInputStyle}
              value={inputValue}
              placeholderTextColor={placeholderTextColor}
              underlineColorAndroid={underlineColorAndroid}
              placeholder={placeholder}
              selectTextOnFocus
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChangeTextCallback}
              onSubmitEditing={onSubmitEditing}
            />
            <CircleButton IconComponent={CalendarIcon} onPress={openDatePicker} />
          </FlexRow>

          {datePickerOpen && (
            <DateTimePicker
              onChange={onChangeDates}
              mode="date"
              display="spinner"
              value={pickerSeedValue}
            />
          )}
          <InvalidMessageLabel />
        </FlexColumn>
      </FlexRow>
    );
  }
);

const localStyles = StyleSheet.create({
  labelStyle: { marginTop: 15, fontSize: 16, fontFamily: APP_FONT_FAMILY },
  isRequiredStyle: { fontSize: 12, color: SUSSOL_ORANGE, fontFamily: APP_FONT_FAMILY },
  invalidMessageStyle: { color: FINALISED_RED, fontFamily: APP_FONT_FAMILY },
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

FormDateInput.defaultProps = {
  placeholder: '',
  placeholderTextColor: SUSSOL_ORANGE,
  underlineColorAndroid: DARKER_GREY,
  invalidMessageStyle: localStyles.invalidMessageStyle,
  isRequiredStyle: localStyles.isRequiredStyle,
  labelStyle: localStyles.labelStyle,
  textInputStyle: localStyles.textInputStyle,
  isRequired: false,
  onValidate: null,
  invalidMessage: '',
  onSubmit: null,
};

FormDateInput.propTypes = {
  invalidMessageStyle: PropTypes.object,
  isRequiredStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  textInputStyle: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  isRequired: PropTypes.bool,
  onValidate: PropTypes.func,
  onChangeDate: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  invalidMessage: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  underlineColorAndroid: PropTypes.string,
  onSubmit: PropTypes.func,
};
