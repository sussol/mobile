/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';

import IonIcon from 'react-native-vector-icons/Ionicons';
import { SUSSOL_ORANGE, APP_FONT_FAMILY } from '../globalStyles/index';

/**
 * Stepper component to update a numerical value. The `value` passed will be
 * cast, so should return a valid number when cast to `Number`.
 *
 * Has increment and decrement buttons which increase the passed value by one.
 * The buttons can also be held, increase by one every 50ms. The increment amount
 * then grows exponentially every 500ms, reseting to one after releasing.
 *
 * @prop {String|Number} value          The current numerical value.
 * @prop {Func}          onChangeText   Callback for updating the value.
 * @prop {Number}        lowerLimit     The lower limit of the numerical range.
 * @prop {Number}        upperLimit     The upper limit of the numerical range.
 * @prop {Number}        iconSize       The size of the icons.
 * @prop {Number}        iconColour     The colour of the icons.
 * @prop {Object}        textInputStyle Style object for the underlying TextInput.
 *
 */
export const StepperInput = ({
  value,
  onChangeText,
  lowerLimit,
  upperLimit,
  iconSize,
  iconColour,
  textInputStyle,
}) => {
  const currentValue = React.useRef(Number(value));
  const currentAdjustmentAmount = React.useRef(1);
  const valueAdjustmentInterval = React.useRef();
  const adjustmentIncreaseInterval = React.useRef();

  const onUpdate = newValue => {
    currentValue.current = newValue;
    onChangeText(newValue);
  };

  const decrementValue = () => {
    if (lowerLimit >= currentValue.current) return;
    currentValue.current -= currentAdjustmentAmount.current;
    onChangeText(currentValue.current);
  };

  const incrementValue = () => {
    if (currentValue.current > upperLimit) return;
    currentValue.current += currentAdjustmentAmount.current;
    onChangeText(currentValue.current);
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
      <TouchableOpacity onPressIn={onStartDecrementPress} onPressOut={onEndLongPress}>
        <IonIcon name="ios-remove" size={iconSize} color={iconColour} />
      </TouchableOpacity>
      <TextInput onChangeText={onUpdate} value={String(value)} style={{ textInputStyle }} />
      <TouchableOpacity onPressIn={onStartIncrementPress} onPressOut={onEndLongPress}>
        <IonIcon name="ios-add" size={iconSize} color={iconColour} />
      </TouchableOpacity>
    </View>
  );
};

const localStyles = StyleSheet.create({
  row: { flexDirection: 'row' },
  textInput: {
    marginHorizontal: 50,
    width: 100,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: APP_FONT_FAMILY,
  },
});

StepperInput.defaultProps = {
  lowerLimit: 0,
  upperLimit: 99999,
  iconSize: 45,
  iconColour: SUSSOL_ORANGE,
  textInputStyle: localStyles.textInput,
};

StepperInput.propTypes = {
  lowerLimit: PropTypes.number,
  upperLimit: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChangeText: PropTypes.func.isRequired,
  iconSize: PropTypes.number,
  iconColour: PropTypes.string,
  textInputStyle: PropTypes.object,
};
