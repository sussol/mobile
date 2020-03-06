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
    increment: 0.01,
  },
  [LANGUAGE_CODES.FRENCH]: {
    decimal: ',',
    separator: '.',
  },
  [LANGUAGE_CODES.SPANISH]: {
    decimal: ',',
    separator: '.',
  },
};

let currentLanguageCode = LANGUAGE_CODES.ENGLISH;

export const setCurrencyLocalisation = languageCode => {
  currentLanguageCode = languageCode;
};

const getCurrencyConfig = () => {
  const defaultConfig = CURRENCY_CONFIGS.DEFAULT ?? {};
  const localConfig = CURRENCY_CONFIGS[currentLanguageCode] ?? {};
  return { ...defaultConfig, ...localConfig };
};

export default value => currency(value, getCurrencyConfig());
