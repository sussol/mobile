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
 * @prop {Func}   onValidate            Function determining if the current input value is valid.
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
  onValidate,
  onChangeText,
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
    isRequired && <Text style={isRequiredStyle}>{validationStrings.isRequired}</Text>;
  const InvalidMessageLabel = () =>
    !isValid && <Text style={invalidMessageStyle}>{invalidMessage}</Text>;

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

  return (
    <View style={flexColumn}>
      <View style={flexRow}>
        <View style={flexColumn}>
          <View style={{ flexRow }}>
            <Text style={labelStyle}>{label}</Text>
            <IsRequiredLabel />
          </View>
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
            onChangeText={onChangeTextCallback}
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
  isRequired: false,
  invalidMessage: '',
  labelStyle: localStyles.labelStyle,
  isRequiredStyle: localStyles.isRequiredStyle,
  invalidMessageStyle: localStyles.invalidMessageStyle,
  textInputStyle: localStyles.textInputStyle,
  onValidate: null,
};

ValidationTextInput.propTypes = {
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  underlineColorAndroid: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  onValidate: PropTypes.func,
  value: PropTypes.string,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  invalidMessage: PropTypes.string,
  labelStyle: PropTypes.object,
  isRequiredStyle: PropTypes.object,
  invalidMessageStyle: PropTypes.object,
  textInputStyle: PropTypes.object,
};
