import { useCallback } from 'react';
import { useIsMounted } from './useIsMounted';
import { useProtectedState } from './useProtectedState';

export const useMountProtectedState = initialValue => {
  const isMounted = useIsMounted();
  const [state, setState] = useProtectedState(initialValue, isMounted);

  const protectedSetState = useCallback((...args) => {
    setState(...args);
  }, []);

  return [state, protectedSetState];
};
