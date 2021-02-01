import { useCallback, useEffect, useRef } from 'react';

import { debounce } from '../utilities';

const DEBOUNCE_MS = 500;

/**
 * Custom hook to be used to optimistically update a TextInput with direct manipulation
 * before invoking the passed onChange callback.
 *
 * @param {Any}  value          Generic value of some state
 * @param {Func} onChange       Function to call when a change event occurs
 * @param {Func} preChangeHook  Function to call when a change event occurs, before setting state.
 * @param {Func} postChangeHook Function to call after setting state after a change event
 */
export const useOptimisticUpdating = (value, onChange, preChangeHook, postChangeHook) => {
  // Ref to pass to the underlying text input which enables direct manipulation of values
  // as triggering state updates every few ms with the long press feature is not performant.
  const ref = useRef();

  // Keep an optimistic state as a ref which when updating will not trigger re-renders at the
  // react level. Update the optimistic value with any values passed as props to ensure this
  // component is still a controlled input.
  const optimisticValue = useRef(value);
  useEffect(() => {
    optimisticValue.current = value;
  }, [value]);

  // Wrapping the onChange callback such that it is only triggered every second attempts to
  // keep the real source of truth in sync with this optimistic state being used for more
  // performant drawing in the interface.
  const wrappedOnChange = useCallback(
    debounce(newValue => {
      onChange(newValue);
    }, DEBOUNCE_MS),
    []
  );

  // When changing, adjust the optimistic state and directly manipulate
  // the TextInput - this draws to the screen without causing a full re-render cycle in
  // React. Then, attempt to update the source of truth.
  const withOptimisticState = addend => {
    const newValue = preChangeHook(optimisticValue.current, addend);
    optimisticValue.current = newValue;
    ref?.current?.setNativeProps({ text: postChangeHook(optimisticValue.current) });
    return newValue;
  };

  const newOnChange = newValue => {
    wrappedOnChange(withOptimisticState(newValue));
  };

  const newValue = postChangeHook(optimisticValue.current);

  return [ref, newValue, newOnChange];
};
