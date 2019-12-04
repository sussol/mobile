import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text, TextInput } from 'react-native';

import RNSlider from '@react-native-community/slider';
import { SUSSOL_ORANGE, WARMER_GREY, FINALISED_RED } from '../globalStyles/index';
import { roundNumber } from '../utilities/index';

/**
 * Component rendering a slider with an additional TextInput in a row.
 * Numbers entered through the TextInput are validated to be a valid number
 * and within the bounds passed as minimumValue and maximumValue.
 *
 * The callback on value changes is invoked when sliding has finished and when
 * a valid number is entered into the TextInput.
 *
 * @prop {Number} minimumValue           The lower bound of valid values.
 * @prop {Number} maximumValue           The upper bound of valid values.
 * @prop {String} minimumTrackTintColour The colour of the track lower than the slider.
 * @prop {String} maximumTrackTintColour The colour of the track greater than the slider.
 * @prop {String} thumbTintColour        The colour of the slider thumb
 * @prop {Number} fractionDigits         How many decimal places.
 * @prop {Number} step                   The steps of the slider. i.e. 0.25 for [.0, .25,.5,.75]
 * @prop {Number} value                  The current value of the input.
 * @prop {Number} onEndEditing           The callback on editing.
 *
 */
export const Slider = ({
  minimumValue,
  maximumValue,
  minimumTrackTintColour,
  maximumTrackTintColour,
  thumbTintColour,
  fractionDigits,
  step,
  value,
  onEndEditing,
}) => {
  if (!onEndEditing) throw new Error('Must provide onEndEditing prop!');

  // Current value of the component which is an always-valid Number.
  const [currentValue, setValue] = React.useState(value);

  // The current string value for the text input. Essentially a buffer for
  // typing while being able to enter invalid numbers and receive feedback.
  const [currentStringValue, setStringValue] = React.useState(String(value));

  // A flag for if the current set value is a valid Number, within the bounds of max and
  // min numbers.
  const [isValid, setValidity] = React.useState(true);

  const { mainContainerStyle, rowStyle, sliderStyle, textInputStyle, errorTextStyle } = localStyles;

  // Ensures a value is a number and within the valid bounds able to be set.
  const validateNewValue = newValue => {
    const tooHigh = newValue > maximumValue;
    const tooLow = newValue < minimumValue;
    const tooNaNy = Number.isNaN(Number(newValue)) || newValue === '';

    const isJustRight = !tooHigh && !tooLow && !tooNaNy;

    return isJustRight;
  };

  // Sets the string value buffer which can be an invalid number. If so,
  // do not set the number value and set the validity flag.
  const setString = React.useCallback(newValue => {
    setStringValue(newValue);
    const isValidNewValue = validateNewValue(newValue);
    if (isValidNewValue) {
      setValidity(true);
      setValue(roundNumber(newValue, fractionDigits));
      onEndEditing(roundNumber(newValue, fractionDigits));
    } else {
      setValidity(false);
    }
  }, []);

  // All slider values will be valid. Set the validity, new value and
  // string value.
  const setSlider = React.useCallback(newValue => {
    const roundedNewValue = roundNumber(newValue, fractionDigits);
    setValue(roundedNewValue);
    setValidity(true);
    setStringValue(String(roundedNewValue));
  }, []);

  return (
    <View style={mainContainerStyle}>
      <View style={rowStyle}>
        <RNSlider
          style={sliderStyle}
          value={currentValue}
          step={step}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          minimumTrackTintColor={minimumTrackTintColour}
          maximumTrackTintColor={maximumTrackTintColour}
          thumbTintColor={thumbTintColour}
          onValueChange={setSlider}
          onSlidingComplete={onEndEditing}
        />

        <TextInput
          style={textInputStyle}
          underlineColorAndroid={isValid ? WARMER_GREY : FINALISED_RED}
          value={currentStringValue}
          onChangeText={setString}
          selectTextOnFocus
        />
      </View>
      {!isValid && (
        <Text style={errorTextStyle}>
          {`Must be a number between ${minimumValue} - ${maximumValue} (inclusive)`}
        </Text>
      )}
    </View>
  );
};

const localStyles = StyleSheet({
  mainContainerStyle: { flexDirection: 'column', flex: 1 },
  rowStyle: { flexDirection: 'row' },
  sliderStyle: { flex: 19 },
  textInputStyle: { textAlign: 'right', flex: 1 },
  errorTextStyle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
    flexGrow: 1,
    fontStyle: 'italic',
    alignSelf: 'flex-end',
  },
});

Slider.defaultProps = {
  minimumValue: 0,
  maximumValue: 100,
  minimumTrackTintColour: SUSSOL_ORANGE,
  maximumTrackTintColour: WARMER_GREY,
  thumbTintColour: SUSSOL_ORANGE,
  fractionDigits: 2,
  step: 0.25,
  value: 20,
};

Slider.propTypes = {
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  minimumTrackTintColour: PropTypes.string,
  maximumTrackTintColour: PropTypes.string,
  thumbTintColour: PropTypes.string,
  fractionDigits: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  onEndEditing: PropTypes.func.isRequired,
};
