import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useMountProtectedState } from './useMountProtectedState';

export const useAfterInteractions = () => {
  const [ready, setReady] = useMountProtectedState(false);
  const focused = useIsFocused();

  useEffect(() => {
    setReady(focused);
  }, [focused]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setReady(focused);
    });
  }, [focused]);

  return ready;
};
