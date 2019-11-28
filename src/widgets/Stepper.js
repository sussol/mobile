import React from 'react';
import PropTypes from 'prop-types';

import { TextInput, View, TouchableOpacity } from 'react-native';

const Stepper = ({ value, onUpdate, lowerLimit, upperLimit }) => {
  const currentValue = React.useRef(Number(value));
  const currentAdjustmentAmount = React.useRef(1);
  const valueIncreaseInterval = React.useRef();
  const incrementIncreaseInterval = React.useRef();

  const decrementValue = () => {
    if (lowerLimit >= currentValue.current) return;
    currentValue.current -= currentAdjustmentAmount.current;
    onUpdate(currentValue.current);
  };

  const incrementValue = () => {
    if (currentValue.current > upperLimit) return;
    currentValue.current += currentAdjustmentAmount.current;
    onUpdate(currentValue.current);
  };

  const inreaseIncrement = () => {
    currentAdjustmentAmount.current *= 2;
  };

  const onStartingLongPress = isIncrement => {
    if (!valueIncreaseInterval.current) {
      valueIncreaseInterval.current = setInterval(
        isIncrement ? incrementValue : decrementValue,
        50
      );
    }

    if (!incrementIncreaseInterval.current) {
      incrementIncreaseInterval.current = setInterval(inreaseIncrement, 500);
    }
  };

  const onEndLongPress = () => {
    clearInterval(valueIncreaseInterval.current);
    clearInterval(incrementIncreaseInterval.current);

    valueIncreaseInterval.current = null;
    incrementIncreaseInterval.current = null;
    currentAdjustmentAmount.current = 1;
  };

  return (
    <View>
      <TouchableOpacity onPressIn={() => onStartingLongPress(true)} onPressOut={onEndLongPress}>
        <View style={{ backgroundColor: 'red', width: 100, height: 100 }} />
      </TouchableOpacity>

      <TextInput onChangeText={onUpdate} value={String(currentValue.current)} />
      <TouchableOpacity onPressIn={() => onStartingLongPress(false)} onPressOut={onEndLongPress}>
        <View style={{ backgroundColor: 'blue', width: 100, height: 100 }} />
      </TouchableOpacity>
    </View>
  );
};

Stepper.defaultProps = {
  lowerLimit: 0,
  upperLimit: 99999,
};

Stepper.propTypes = {
  lowerLimit: PropTypes.number,
  upperLimit: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export const TestPage = () => {
  const [value, setValue] = React.useState('0');
  const onUpdate = x => setValue(String(x));
  return (
    <View>
      <Stepper value={value} onUpdate={onUpdate} />
    </View>
  );
};
