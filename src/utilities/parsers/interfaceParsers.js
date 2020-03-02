/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { parsePositiveInteger } from '..';

/**
 * Used for interface parsing to ensure that the entered input is
 * 0 <= positive integer <= 999999999999
 *
 * @param {String} inputString
 */
export const parsePositiveIntegerInterfaceInput = (inputString = '') => {
  const asPositiveInteger = parsePositiveInteger(inputString);
  return Math.min(asPositiveInteger, 999999999999);
};
