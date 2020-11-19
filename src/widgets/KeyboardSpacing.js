import React, { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useKeyboardHeight } from '../hooks/index';

export const KeyboardSpacing = React.memo(() => {
  const height = useKeyboardHeight();
  const animatedValue = useRef(new Animated.Value(0));

  Animated.timing(animatedValue.current, {
    toValue: height,
    duration: 100,
    easing: Easing.linear,
  }).start();

  return <Animated.View style={{ height: animatedValue.current }} />;
});
