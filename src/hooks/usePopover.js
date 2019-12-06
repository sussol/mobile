import React, { useState, useCallback, useRef } from 'react';
import { useNavigationFocus } from './useNavigationFocus';

/**
 * Hook which manages popover position over a DOM element.
 * Pass a ref created by React.createRef. Receive callbacks,
 */
export const usePopover = navigation => {
  const [visibilityState, setVisibilityState] = useState(false);
  const ref = useRef(React.createRef());

  const showPopover = useCallback(() => setVisibilityState(true), []);
  const closePopover = useCallback(() => setVisibilityState(false), []);

  useNavigationFocus(navigation, null, closePopover);

  return [ref, visibilityState, showPopover, closePopover];
};
