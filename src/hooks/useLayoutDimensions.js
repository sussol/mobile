/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

/**
 * Custom hook used to store state of the width and height of a component.
 * Intended use is to pass the setDimensions function to a components
 * onLayout prop, which will set the width and height of the state.
 */
export const useLayoutDimensions = () => {
  const [{ width, height }, setDimensionState] = React.useState({ width: 0, height: 0 });

  const setDimensions = React.useCallback(event => {
    const { nativeEvent = {} } = event ?? {};
    const { layout = {} } = nativeEvent;
    const { width: newWidth = null, height: newHeight = null } = layout;

    setDimensionState({ width: newWidth, height: newHeight });
  }, []);

  return [width, height, setDimensions];
};
