import React from 'react';
import { Button } from 'react-native-ui-components';

export function OnePressButton(props) {
  let hasBeenPressed = false;
  const onPress = () => {
    if (hasBeenPressed || !props.onPress) return;
    props.onPress();
    hasBeenPressed = true;
  };
  return (
    <Button
      {...props}
      onPress={onPress}
    />
  );
}

OnePressButton.propTypes = Button.propTypes;

