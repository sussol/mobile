import { useState, useCallback } from 'react';

/**
 * Hook which manages popover position over a DOM element.
 * Pass a ref created by React.createRef. Receive callbacks,
 */
export const usePopover = () => {
  const [visibilityState, setVisibilityState] = useState(false);

  const showPopover = useCallback(() => setVisibilityState(true), []);
  const closePopover = useCallback(() => setVisibilityState(false), []);

  return [visibilityState, showPopover, closePopover];
};
