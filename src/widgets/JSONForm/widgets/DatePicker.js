/* eslint-disable no-console */
import React from 'react';
import { TextInput } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';

import { DatePickerButton } from '../../DatePickerButton';
import { FlexRow } from '../../FlexRow';
import { useJSONFormOptions } from '../JSONFormContext';
import { DARKER_GREY, LIGHT_GREY } from '../../../globalStyles/colors';

export const DatePicker = ({ disabled, value, onChange, placeholder, readonly }) => {
  const { focusController } = useJSONFormOptions();
  const ref = focusController.useRegisteredRef();

  return (
    <FlexRow>
      <TextInput
        style={{ flex: 1 }}
        placeholderTextColor={LIGHT_GREY}
        underlineColorAndroid={DARKER_GREY}
        placeholder={placeholder}
        editable={!(readonly || disabled)}
        value={value}
        ref={ref}
        onSubmitEditing={() => focusController.next(ref)}
        onChangeText={date => onChange(date)}
        returnKeyType="next"
        autoCapitalize="none"
        keyboardType="numeric"
        autoCorrect={false}
      />
      <DatePickerButton
        isDisabled={readonly || disabled}
        initialValue={new Date()}
        onDateChanged={date => onChange(moment(date).format('YYYY-MM-DD'))}
      />
    </FlexRow>
  );
};

DatePicker.defaultProps = {
  value: '',
};

DatePicker.propTypes = {
  disabled: PropTypes.bool.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  readonly: PropTypes.bool.isRequired,
};
