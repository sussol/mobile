/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, StyleSheet } from 'react-native';

import { parsePositiveInteger } from '../utilities';

import { CircleButton } from './CircleButton';
import { AddIcon, MinusIcon } from './icons';

import { APP_FONT_FAMILY } from '../globalStyles';

/**
 * Input component which will update a numerical value. The `value` passed will be
 * cast, so should return a valid number when cast to `Number`.
 *
 * Has increment and decrement buttons which increase the passed value by one.
 * The buttons can also be held, increase by one every 50ms. The increment amount
 * then grows exponentially every 500ms, reseting to one after releasing.
 *
 * Component uses state to update itself, and a ref for storing the current value as
 * this is far more responsive than updating the redux store and re-rendering every 50ms.
 *
 * @prop {String|Number} value          The current numerical value.
 * @prop {Func}          onChangeText   Callback for updating the value.
 * @prop {Number}        lowerLimit     The lower limit of the numerical range.
 * @prop {Number}        upperLimit     The upper limit of the numerical range.
 * @prop {Object}        textInputStyle Style object for the underlying TextInput.
 * @prop {Bool}          isDisabled     Indicator if this component should be editable.
 *
 */
export const StepperInput = ({
  value,
  onChangeText,
  lowerLimit,
  upperLimit,
  textInputStyle,
  isDisabled,
}) => {
  const [, setCurrentValueState] = React.useState(Number(value));
  const currentValue = React.useRef(Number(value));
  const currentAdjustmentAmount = React.useRef(1);
  const valueAdjustmentInterval = React.useRef();
  const adjustmentIncreaseInterval = React.useRef();

  const parseNumber = number =>
    Math.max(Math.min(parsePositiveInteger(number), upperLimit), lowerLimit);

  const onUpdate = newValue => {
    const updateValue = parseNumber(newValue);
    currentValue.current = updateValue;
    setCurrentValueState(updateValue);
    onChangeText(updateValue);
  };

  const decrementValue = () => onUpdate(currentValue.current - currentAdjustmentAmount.current);
  const incrementValue = () => onUpdate(currentValue.current + currentAdjustmentAmount.current);

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
        onPressIn={isDisabled ? null : onStartDecrementPress}
        onPressOut={isDisabled ? null : onEndLongPress}
      />
      <TextInput
        editable={!isDisabled}
        onChangeText={onUpdate}
        value={String(currentValue.current)}
        style={textInputStyle}
      />
      <CircleButton
        IconComponent={AddIcon}
        onPressIn={isDisabled ? null : onStartIncrementPress}
        onPressOut={isDisabled ? null : onEndLongPress}
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
  isDisabled: false,
};

StepperInput.propTypes = {
  lowerLimit: PropTypes.number,
  upperLimit: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChangeText: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
  isDisabled: PropTypes.bool,
};
