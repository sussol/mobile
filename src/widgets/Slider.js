import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TextInput } from 'react-native';

import RNSlider from '@react-native-community/slider';
import { SUSSOL_ORANGE, WARMER_GREY } from '../globalStyles';
import { roundNumber } from '../utilities';
import { FlexRow } from './FlexRow';
import { generalStrings } from '../localization';

/**
 * Component rendering a slider with an additional TextInput in a row.
 * Numbers entered through the TextInput are validated to be a valid number
 * and within the bounds passed as minimumValue and maximumValue.
 *
 * The callback on value changes is invoked when sliding has finished and when
 * a valid number is entered into the TextInput.
 *
 * @prop {Bool}   isDisabled             Indicator whether this component is disabled.
 * @prop {String} minimumTrackTintColor The color of the track lower than the slider.
 * @prop {String} maximumTrackTintColor The color of the track greater than the slider.
 * @prop {String} thumbTintColor        The color of the slider thumb
 * @prop {Number} fractionDigits         How many decimal places.
 * @prop {Number} step                   The steps of the slider. i.e. 0.25 for [.0, .25,.5,.75]
 * @prop {Number} value                  The current value of the input.
 * @prop {Number} onEndEditing           The callback on editing.
 * @prop {Number} minimumValue           The lower bound of valid values.
 * @prop {Number} maximumValue           The upper bound of valid values.
 *
 */
export const Slider = React.forwardRef(
  (
    {
      minimumValue,
      maximumValue,
      minimumTrackTintColor,
      maximumTrackTintColor,
      thumbTintColor,
      fractionDigits,
      step,
      value,
      onEndEditing,
      isDisabled,
      textUnderlineColour,
    },
    ref
  ) => {
    if (!onEndEditing) throw new Error('Must provide onEndEditing prop!');

    React.useEffect(() => {
      if (value !== currentValue) {
        setString(value);
        setSlider(value);
      }
    }, [value]);

    // Current value of the component which is an always-valid Number.
    const [currentValue, setValue] = React.useState(value);

    // The current string value for the text input. Essentially a buffer for
    // typing while being able to enter invalid numbers and receive feedback.
    const [currentStringValue, setStringValue] = React.useState(String(value));

    // A flag for if the current set value is a valid Number, within the bounds of max and
    // min numbers.
    const [isValid, setValidity] = React.useState(true);

    const { sliderStyle, textInputStyle, errorTextStyle } = localStyles;

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
      <>
        <FlexRow>
          <RNSlider
            disabled={isDisabled}
            style={{ ...sliderStyle, alignSelf: 'center' }}
            value={currentValue}
            step={step}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
            minimumTrackTintColor={minimumTrackTintColor}
            maximumTrackTintColor={maximumTrackTintColor}
            thumbTintColor={thumbTintColor}
            onValueChange={setSlider}
            onSlidingComplete={onEndEditing}
          />
          <TextInput
            ref={ref}
            enabled={!isDisabled}
            style={textInputStyle}
            underlineColorAndroid={textUnderlineColour}
            value={currentStringValue}
            onChangeText={setString}
            selectTextOnFocus
          />
        </FlexRow>

        {!isValid && (
          <Text style={errorTextStyle}>
            {`${generalStrings.must_be_a_number_between} ${minimumValue} - ${maximumValue} ${generalStrings.inclusive}`}
          </Text>
        )}
      </>
    );
  }
);

const localStyles = StyleSheet.create({
  mainContainerStyle: { flexDirection: 'column', flex: 1 },
  rowStyle: { flexDirection: 'row' },
  sliderStyle: { flex: 9, alignSelf: 'center' },
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
  minimumTrackTintColor: SUSSOL_ORANGE,
  maximumTrackTintColor: WARMER_GREY,
  thumbTintColor: SUSSOL_ORANGE,
  fractionDigits: 2,
  step: 0.25,
  value: 20,
  isDisabled: false,
  textUnderlineColour: WARMER_GREY,
};

Slider.propTypes = {
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  minimumTrackTintColor: PropTypes.string,
  maximumTrackTintColor: PropTypes.string,
  thumbTintColor: PropTypes.string,
  fractionDigits: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  onEndEditing: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  textUnderlineColour: PropTypes.string,
};
