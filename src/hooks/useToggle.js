import { useReducer } from 'react';

export const useToggle = (initialValue = false) => useReducer(state => !state, initialValue);
