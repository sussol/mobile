import React from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';

const Stepper = ({ value, onUpdate }) => {
  const currentValue = React.useRef(Number(value));
  const currentIncrementAmount = React.useRef(1);
  const valueIncreaseInterval = React.useRef();
  const incrementIncreaseInterval = React.useRef();

  const decrementValue = () => onUpdate(Number(value) - 1);
  const incrementValue = () => {
    currentValue.current += currentIncrementAmount.current;
    onUpdate(Number(currentValue.current) + currentIncrementAmount.current);
  };

  const inreaseIncrement = () => {
    currentIncrementAmount.current *= 2;
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
    valueIncreaseInterval.current = null;
    clearInterval(incrementIncreaseInterval.current);
    incrementIncreaseInterval.current = null;
    currentIncrementAmount.current = 1;
  };

  return (
    <View>
      <TouchableOpacity onPressIn={onStartingLongPress} onPressOut={onEndLongPress}>
        <View style={{ backgroundColor: 'red', width: 100, height: 10 }} />
      </TouchableOpacity>

      <TextInput onChangeText={onUpdate} value={String(currentValue.current)} />
    </View>
  );
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
