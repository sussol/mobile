/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import currency from 'currency.js';
import { LANGUAGE_CODES } from '.';

const CURRENCY_CONFIGS = {
  DEFAULT: {
    decimal: '.',
    separator: ',',
  },
  [LANGUAGE_CODES.FRENCH]: {
    decimal: ',',
    separator: '.',
  },
};

let currentLanguageCode = LANGUAGE_CODES.ENGLISH;

export const setCurrencyLocalisation = languageCode => {
  currentLanguageCode = languageCode;
};

const getCurrencyConfig = () => CURRENCY_CONFIGS[currentLanguageCode] || CURRENCY_CONFIGS.DEFAULT;

export default value => currency(value, getCurrencyConfig());
