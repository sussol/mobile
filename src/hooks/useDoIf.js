/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';

const doIf = (doThis, ifThis) => {
  if (ifThis()) return doThis();
  return null;
};

export const useDoIf = (doThis, ifThis) =>
  React.useCallback(
    (...rest) => {
      doIf(() => doThis(...rest), ifThis);
    },
    [ifThis, doThis]
  );
