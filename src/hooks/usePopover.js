import React, { useState, useCallback, useRef } from 'react';

/**
 * Hook which manages popover position over a DOM element.
 * Pass a ref created by React.createRef. Receive callbacks,
 */
export const usePopover = () => {
  const [visibilityState, setVisibilityState] = useState(false);
  const ref = useRef(React.createRef());

  const showPopover = useCallback(() => setVisibilityState(true), []);
  const closePopover = useCallback(() => setVisibilityState(false), []);

  return [ref, visibilityState, showPopover, closePopover];
};
