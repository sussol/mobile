/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { FormLabel } from './FormLabel';
import { FormInvalidMessage } from './FormInvalidMessage';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';

/**
 * Uncontrolled wrapper component around a TextInput with validation
 * and labels.
 * @prop {String} placeholder           Placeholder text string
 * @prop {String} placeholderTextColor  Color of the placeholder text
 * @prop {String} underlineColorAndroid Color of the underline colour
 * @prop {Bool}   isRequired            Indicator whether to show the is required label
 * @prop {String} label                 The form label for this text input, displayed to the left.
 * @prop {String} invalidMessage        Displayed under the TextInput when the input is invalid.
 * @prop {Func}   onValidate            Function determining if the current input value is valid.
 * @prop {String} value                 The initial value of the input.
 * @prop {Object} labelStyle            Style of the label.
 * @prop {Object} textInputStyle        Style of the underlying TextInput.
 * @prop {Func}   onSubmit              Callback from submitting - component holds internal state.
 * @prop {Bool}   isDisabled            Indicator whether this component is disabled.
 */
export const FormTextInput = React.forwardRef(
  (
    {
      placeholder,
      placeholderTextColor,
      underlineColorAndroid,
      isRequired,
      label,
      invalidMessage,
      onValidate,
      onChangeText,
      value,
      textInputStyle,
      onSubmit,
      isDisabled,
    },
    ref
  ) => {
    const [inputState, setInputState] = React.useState({
      isValid: true,
      inputValue: value,
    });
    const { inputValue, isValid } = inputState;
    const { flexRow, flexColumn } = localStyles;

    // On checking the validity of the input, if it has changed, trigger the callback
    // to notify the parent.
    const onCheckValidity = React.useCallback(
      inputToCheck => {
        const newValidState = onValidate ? onValidate(inputToCheck) : true;
        return newValidState;
      },
      [isValid]
    );

    // When changing the value of the input, check the new validity and set the new input.
    // Do not restrict input, but provide feedback to the user.
    const onChangeTextCallback = React.useCallback(
      newValue => {
        const newValidState = onCheckValidity(newValue);
        setInputState({ isValid: newValidState, inputValue: newValue });
        onChangeText(newValue);
      },
      [isValid]
    );

    const onSubmitEditing = React.useCallback(event => onSubmit?.(event.nativeEvent.text), [
      onSubmit,
    ]);

    return (
      <View style={flexColumn}>
        <View style={flexRow}>
          <View style={flexColumn}>
            <FormLabel value={label} isRequired={isRequired} />
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
              editable={!isDisabled}
            />
            <FormInvalidMessage message={invalidMessage} isValid={isValid} />
          </View>
        </View>
      </View>
    );
  }
);

const localStyles = StyleSheet.create({
  flexRow: { flex: 1, flexDirection: 'row' },
  flexColumn: { flex: 1, flexDirection: 'column' },
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

FormTextInput.defaultProps = {
  placeholder: '',
  placeholderTextColor: SUSSOL_ORANGE,
  underlineColorAndroid: DARKER_GREY,
  value: '',
  isRequired: false,
  invalidMessage: '',
  textInputStyle: localStyles.textInputStyle,
  onValidate: null,
  onSubmit: null,
  isDisabled: false,
};

FormTextInput.propTypes = {
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  underlineColorAndroid: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  onValidate: PropTypes.func,
  value: PropTypes.string,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  invalidMessage: PropTypes.string,
  textInputStyle: PropTypes.object,
  onSubmit: PropTypes.func,
  isDisabled: PropTypes.bool,
};
