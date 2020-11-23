import { useEffect, useState, useCallback } from 'react';
import { Keyboard } from 'react-native';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Cache the funcs so the refs are stable for removing the subs
  const callback = useCallback(
    ({ endCoordinates: { height } }) => setKeyboardHeight(height ?? 0),
    []
  );

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', callback);

    return () => Keyboard.removeListener('keyboardDidShow', callback);
  }, []);

  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', callback);
    return () => Keyboard.removeListener('keyboardDidHide', callback);
  }, []);

  return keyboardHeight;
};
