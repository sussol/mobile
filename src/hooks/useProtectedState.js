/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { useDoIf } from './useDoIf';

export const useProtectedState = (initialState, controller) => {
  const [state, _setState] = React.useState(initialState);
  const setState = useDoIf(_setState, controller);
  return [state, setState];
};
