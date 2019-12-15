/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { validationStrings } from '../localization';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, DARKER_GREY, FINALISED_RED } from '../globalStyles/index';

/**
 * Uncontrolled wrapper component around a TextInput with validation
 * and labels.
 * @prop {String} placeholder           Placeholder text string
 * @prop {String} placeholderTextColor  Color of the placeholder text
 * @prop {String} underlineColorAndroid Color of the underline colour
 * @prop {Bool}   isRequired            Indicator whether to show the is required label
 * @prop {String} label                 The form label for this text input, displayed to the left.
 * @prop {String} invalidMessage        Displayed under the TextInput when the input is invalid.
 * @prop {Func}   onSubmitEditing       Callback when editing has completed.
 * @prop {Func}   onValidate            Function determining if the current input value is valid.
 * @prop {Func}   onChangeValidState    Callback when the validity state changes.
 * @prop {String} value                 The initial value of the input.
 * @prop {Object} labelStyle            Style of the label.
 * @prop {Object} isRequiredStyle       Style for the is required label.
 * @prop {Object} invalidMessageStyle   Style for the invalid message label.
 * @prop {Object} textInputStyle        Style of the underlying TextInput.
 */
export const ValidationTextInput = ({
  placeholder,
  placeholderTextColor,
  underlineColorAndroid,
  isRequired,
  label,
  invalidMessage,
  onSubmitEditing,
  onValidate,
  onChangeValidState,
  value,
  labelStyle,
  isRequiredStyle,
  invalidMessageStyle,
  textInputStyle,
}) => {
  const [inputState, setInputState] = React.useState({
    isValid: true,
    inputValue: value,
  });
  const { inputValue, isValid } = inputState;
  const { flexRow, flexColumn } = localStyles;

  const IsRequiredLabel = () =>
    isRequired && <Text style={isRequiredStyle}>{validationStrings.is_required}</Text>;
  const InvalidMessageLabel = () =>
    !isValid && <Text style={invalidMessageStyle}>{invalidMessage}</Text>;

  const onCheckValidity = React.useCallback(
    inputToCheck => {
      const newValidState = onValidate(inputToCheck);
      if (newValidState !== isValid) onChangeValidState(newValidState);
      return newValidState;
    },
    [isValid]
  );

  const onCompletedInput = React.useCallback(() => {
    onSubmitEditing(inputValue);
  }, []);

  const onChangeText = React.useCallback(
    newValue => {
      const newValidState = onCheckValidity(newValue);
      setInputState({ isValid: newValidState, inputValue: newValue });
    },
    [isValid, onChangeValidState]
  );

  React.useEffect(() => {
    onChangeText(value);
  }, [value]);

  return (
    <View style={flexColumn}>
      <View style={flexRow}>
        <View>
          <Text style={labelStyle}>{label}</Text>
          <IsRequiredLabel />
        </View>
        <View style={flexColumn}>
          <TextInput
            style={textInputStyle}
            value={inputValue}
            placeholderTextColor={placeholderTextColor}
            underlineColorAndroid={underlineColorAndroid}
            placeholder={placeholder}
            selectTextOnFocus
            returnKeyType="next"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeText}
            onBlur={onCompletedInput}
            onSubmitEditing={onCompletedInput}
          />
          <InvalidMessageLabel />
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  flexRow: { flex: 1, flexDirection: 'row' },
  flexColumn: { flex: 1, flexDirection: 'column' },
  labelStyle: { marginTop: 15, fontSize: 16, fontFamily: APP_FONT_FAMILY },
  isRequiredStyle: { fontSize: 12, color: SUSSOL_ORANGE, fontFamily: APP_FONT_FAMILY },
  invalidMessageStyle: { color: FINALISED_RED, fontFamily: APP_FONT_FAMILY },
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

ValidationTextInput.defaultProps = {
  placeholder: '',
  placeholderTextColor: SUSSOL_ORANGE,
  underlineColorAndroid: DARKER_GREY,
  value: '',
  isRequired: true,
  invalidMessage: 'asdasdasdasdaszzzzzzzzzzz',
  labelStyle: localStyles.labelStyle,
  isRequiredStyle: localStyles.isRequiredStyle,
  invalidMessageStyle: localStyles.invalidMessageStyle,
  textInputStyle: localStyles.textInputStyle,
};

ValidationTextInput.propTypes = {
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  underlineColorAndroid: PropTypes.string,
  onSubmitEditing: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  onChangeValidState: PropTypes.func.isRequired,
  value: PropTypes.string,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  invalidMessage: PropTypes.string,
  labelStyle: PropTypes.object,
  isRequiredStyle: PropTypes.object,
  invalidMessageStyle: PropTypes.object,
  textInputStyle: PropTypes.object,
};
