/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { selectBluetoothState } from './index';

export const selectSendingBlinkTo = state => {
  const bluetooth = selectBluetoothState(state);
  const { blink } = bluetooth || {};
  const { sendingBlinkTo = '' } = blink || {};
  return sendingBlinkTo;
};
