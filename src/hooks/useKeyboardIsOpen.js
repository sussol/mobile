import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

const KEYBOARD_DID_SHOW = 'keyboardDidShow';
const KEYBOARD_DID_HIDE = 'keyboardDidHide';

export const useKeyboardIsOpen = () => {
  const [isOpen, toggle] = useState(false);
  useEffect(() => {
    Keyboard.addListener(KEYBOARD_DID_SHOW, () => toggle(true));
    Keyboard.addListener(KEYBOARD_DID_HIDE, () => toggle(false));

    return () => {
      Keyboard.removeListener(KEYBOARD_DID_SHOW, () => toggle(true));
      Keyboard.removeListener(KEYBOARD_DID_HIDE, () => toggle(false));
    };
  });

  return isOpen;
};
