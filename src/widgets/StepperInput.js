/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, StyleSheet } from 'react-native';

import { APP_FONT_FAMILY } from '../globalStyles/index';
import { CircleButton } from './CircleButton';
import { AddIcon, MinusIcon } from './icons';

/**
 * Input component which will update a numerical value. The `value` passed will be
 * cast, so should return a valid number when cast to `Number`.
 *
 * Has increment and decrement buttons which increase the passed value by one.
 * The buttons can also be held, increase by one every 50ms. The increment amount
 * then grows exponentially every 500ms, reseting to one after releasing.
 *
 * Component uses state to update itself, and a ref for storing the current value. This
 * is a bit of a hack, but is much more responsive to the rapid updates of the input.
 *
 * @prop {String|Number} value          The current numerical value.
 * @prop {Func}          onChangeText   Callback for updating the value.
 * @prop {Number}        lowerLimit     The lower limit of the numerical range.
 * @prop {Number}        upperLimit     The upper limit of the numerical range.
 * @prop {Object}        textInputStyle Style object for the underlying TextInput.
 *
 */
export const StepperInput = ({ value, onChangeText, lowerLimit, upperLimit, textInputStyle }) => {
  const [, setCurrentValueState] = React.useState(Number(value));
  const currentValue = React.useRef(Number(value));
  const currentAdjustmentAmount = React.useRef(1);
  const valueAdjustmentInterval = React.useRef();
  const adjustmentIncreaseInterval = React.useRef();

  const parseNumber = number => Math.max(Math.min(number, upperLimit), lowerLimit);

  const onUpdate = newValue => {
    const updateValue = parseNumber(newValue);
    currentValue.current = updateValue;
    setCurrentValueState(updateValue);
    onChangeText(updateValue);
  };

  const decrementValue = () => {
    const updateValue = parseNumber(currentValue.current - currentAdjustmentAmount.current);
    currentValue.current = updateValue;
    setCurrentValueState(updateValue);
    onChangeText(updateValue);
  };

  const incrementValue = () => {
    const updateValue = parseNumber(currentValue.current + currentAdjustmentAmount.current);
    currentValue.current = updateValue;
    setCurrentValueState(updateValue);
    onChangeText(updateValue);
  };

  const inreaseIncrement = () => {
    currentAdjustmentAmount.current *= 2;
  };

  const onStartingLongPress = isIncrement => {
    if (!valueAdjustmentInterval.current) {
      valueAdjustmentInterval.current = setInterval(
        isIncrement ? incrementValue : decrementValue,
        50
      );
    }

    if (!adjustmentIncreaseInterval.current) {
      adjustmentIncreaseInterval.current = setInterval(inreaseIncrement, 500);
    }
  };

  const onEndLongPress = () => {
    clearInterval(valueAdjustmentInterval.current);
    clearInterval(adjustmentIncreaseInterval.current);

    valueAdjustmentInterval.current = null;
    adjustmentIncreaseInterval.current = null;
    currentAdjustmentAmount.current = 1;
  };

  const onStartDecrementPress = () => onStartingLongPress(false);
  const onStartIncrementPress = () => onStartingLongPress(true);

  return (
    <View style={localStyles.row}>
      <CircleButton
        IconComponent={MinusIcon}
        onPressIn={onStartDecrementPress}
        onPressOut={onEndLongPress}
      />
      <TextInput
        onChangeText={onUpdate}
        value={String(currentValue.current)}
        style={textInputStyle}
      />
      <CircleButton
        IconComponent={AddIcon}
        onPressIn={onStartIncrementPress}
        onPressOut={onEndLongPress}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  textInput: {
    marginHorizontal: 25,
    width: 100,
    textAlign: 'center',
    fontSize: 24,

    fontFamily: APP_FONT_FAMILY,
  },
});

StepperInput.defaultProps = {
  lowerLimit: 0,
  upperLimit: 99999,
  textInputStyle: localStyles.textInput,
};

StepperInput.propTypes = {
  lowerLimit: PropTypes.number,
  upperLimit: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChangeText: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
};
